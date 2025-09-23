"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Settings,
  Menu,
  X,
  Sparkles,
  FolderOpen,
  Gift,
  Clock,
  LogOut,
  User,
  ShoppingCart,
  Warehouse,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigation = [
    {
      href: "/dashboard/salons",
      name: "Salon Management",
      icon: Building2,
      description: "Manage all salons",
    },
    {
      href: "/dashboard/inventory",
      name: "Inventory Management",
      icon: Warehouse  ,
      description: "Manage ll inventory",
    },
    {
      href: "/dashboard/users",
      name: "User Management",
      icon: User ,
      description: "Manage salon users",
    },
    {
      href: "/dashboard/settings",
      name: "Settings",
      icon: Settings,
      description: "System settings",
    },

    {
      name: "Categories",
      href: "/dashboard/categories",
      icon: FolderOpen,
      description: "Service types"
    },

    {
      name: "Packages",
      href: "/dashboard/packages",
      icon: Gift,
      description: "Service bundles",
    },
    {
      name: "Working Hours",
      href: "/dashboard/working-hours",
      icon: Clock,
      description: "Staff working hours",
    },
    {
      name: "Staff Dashboard",
      href: "/dashboard/staff-dashboard",
      icon: LayoutDashboard,
      description: "Staff oversight",
    },
    {
      name: "Staff Appointments",
      href: "/dashboard/staff-appointments",
      icon: Users,
      description: "Salon owner's staff control",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-blue-100 shadow-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Salon Admin
                  </h1>
                  <p className="text-sm text-gray-600">Management Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-4 text-left rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]"
                          : "hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.01]"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 mr-3 flex-shrink-0",
                          isActive ? "text-white" : "text-blue-600"
                        )}
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div
                          className={cn(
                            "text-xs",
                            isActive ? "text-blue-100" : "text-gray-500"
                          )}
                        >
                          {item.description}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-blue-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {navigation.find((item) => item.href === pathname)?.name}
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user?.displayName || user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
