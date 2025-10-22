'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnhancedOrganization, 
  Role, 
  Permission, 
  TenantUsage, 
  SubscriptionPlan,
  TenantRegistration 
} from '@/types/multi-tenant';

// Multi-Tenant Admin Dashboard Component
export default function MultiTenantAdminDashboard() {
  const [organizations, setOrganizations] = useState<EnhancedOrganization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [registrations, setRegistrations] = useState<TenantRegistration[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'organizations' | 'roles' | 'registrations' | 'billing'>('organizations');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load organizations
      const orgResponse = await fetch('/api/tenant/organizations');
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganizations(orgData.organizations || []);
      }

      // Load roles and permissions
      const rolesResponse = await fetch('/api/tenant/roles?include_permissions=true');
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.roles || []);
        setPermissions(rolesData.permissions || []);
      }

      // Load pending registrations
      const regResponse = await fetch('/api/tenant/registrations');
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrations(regData.registrations || []);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new organization
  const createOrganization = async (formData: {
    organization_name: string;
    admin_email: string;
    admin_name: string;
    plan_name: string;
  }) => {
    try {
      const response = await fetch('/api/tenant/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadDashboardData();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to create organization' };
    }
  };

  // Organization management component
  const OrganizationManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Organizations</h3>
        <CreateOrganizationForm onSubmit={createOrganization} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>
    </div>
  );

  // Organization card component
  const OrganizationCard = ({ organization }: { organization: EnhancedOrganization }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-lg">{organization.name}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          organization.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
          organization.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {organization.subscription_status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>Type:</strong> {organization.organization_type}</p>
        <p><strong>Created:</strong> {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}</p>
        {organization.subscription_plan && (
          <p><strong>Plan:</strong> {organization.subscription_plan.display_name_en}</p>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
          Manage Users
        </button>
        <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
          View Details
        </button>
      </div>
    </div>
  );

  // Create organization form
  const CreateOrganizationForm = ({ onSubmit }: { 
    onSubmit: (data: any) => Promise<{ success: boolean; error?: string }> 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
      organization_name: '',
      admin_email: '',
      admin_name: '',
      plan_name: 'starter'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await onSubmit(formData);
      if (result.success) {
        setIsOpen(false);
        setFormData({ organization_name: '', admin_email: '', admin_name: '', plan_name: 'starter' });
      } else {
        alert(result.error);
      }
    };

    if (!isOpen) {
      return (
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Organization
        </button>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Create New Organization</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium mb-1">Organization Name</label>
              <input
                id="org-name"
                type="text"
                required
                placeholder="Enter organization name"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium mb-1">Admin Email</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.admin_email}
                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium mb-1">Admin Name</label>
              <input
                id="admin-name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.admin_name}
                onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="subscription-plan" className="block text-sm font-medium mb-1">Subscription Plan</label>
              <select
                id="subscription-plan"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
              >
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex space-x-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Role manager component
  const RoleManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Roles & Permissions</h3>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create Role
        </button>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{role.display_name_en}</h4>
                <p className="text-sm text-gray-600">{role.description_en}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    role.is_system_role ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {role.is_system_role ? 'System Role' : 'Organization Role'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                  Edit
                </button>
                <button className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Registration manager
  const RegistrationManager = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Pending Registrations</h3>
      <div className="space-y-4">
        {registrations.filter(reg => reg.status === 'pending').map((registration) => (
          <div key={registration.id} className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{registration.organization_name}</h4>
                <p className="text-sm text-gray-600">Admin: {registration.admin_name} ({registration.admin_email})</p>
                <p className="text-sm text-gray-600">Requested Plan: {registration.requested_plan}</p>
                <p className="text-sm text-gray-600">Submitted: {new Date(registration.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                  Approve
                </button>
                <button className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Multi-Tenant Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'organizations', label: 'Organizations' },
              { id: 'roles', label: 'Roles & Permissions' },
              { id: 'registrations', label: 'Registrations' },
              { id: 'billing', label: 'Billing & Usage' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {selectedTab === 'organizations' && <OrganizationManager />}
          {selectedTab === 'roles' && <RoleManager />}
          {selectedTab === 'registrations' && <RegistrationManager />}
          {selectedTab === 'billing' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">Billing & Usage</h3>
              <p className="text-gray-600 mt-2">Coming soon - billing analytics and usage monitoring</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}