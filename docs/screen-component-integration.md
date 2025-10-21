// Integration guide for your Screen component in CPE Connect

## 🔄 How to Integrate Your Screen Component

### 1. **Replace Current Layout Patterns**

Your original Screen component can be enhanced and used throughout the platform:

#### Current Pattern (in dashboard/page.tsx):
```tsx
<div className="container mx-auto p-6">
  {content}
</div>
```

#### Enhanced Pattern with Screen:
```tsx
<Screen variant="dashboard" padding="lg">
  <div className="mx-auto max-w-7xl">
    {content}
  </div>
</Screen>
```

### 2. **Use Cases in Your Platform**

#### A) Dashboard Pages
```tsx
// app/[locale]/dashboard/page.tsx
import Screen from '@/components/ui/screen';

export default function Dashboard() {
  return (
    <Screen variant="dashboard" fullHeight>
      {/* Dashboard content */}
    </Screen>
  );
}
```

#### B) Course Module Pages
```tsx
// app/[locale]/courses/[id]/modules/[moduleId]/page.tsx
import Screen from '@/components/ui/screen';

export default function ModulePage() {
  return (
    <Screen variant="course" className="max-w-4xl mx-auto my-8">
      {/* Module content with video and quiz */}
    </Screen>
  );
}
```

#### C) Authentication Pages
```tsx
// app/[locale]/auth/signin/page.tsx
import Screen from '@/components/ui/screen';

export default function SignIn() {
  return (
    <Screen variant="auth" fullHeight>
      <div className="flex items-center justify-center">
        <Screen variant="default" className="max-w-md w-full bg-white rounded-lg shadow-lg">
          {/* Sign in form */}
        </Screen>
      </div>
    </Screen>
  );
}
```

### 3. **Integration with Existing Theme System**

Your Screen component now integrates with:
- ✅ Tailwind CSS classes
- ✅ Dark/light mode (via your ThemeProvider)
- ✅ Responsive design
- ✅ TypeScript type safety
- ✅ Internationalization context

### 4. **Next Steps**

1. **Replace Layout Patterns**: Update existing pages to use Screen component
2. **Add Animation**: Add smooth transitions between screens
3. **Accessibility**: Add ARIA labels and focus management
4. **Performance**: Optimize with React.memo if needed

This transforms your simple wrapper into a powerful, reusable layout system!