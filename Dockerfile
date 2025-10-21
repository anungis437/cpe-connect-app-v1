# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    tini

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next ./

# Copy configuration files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]