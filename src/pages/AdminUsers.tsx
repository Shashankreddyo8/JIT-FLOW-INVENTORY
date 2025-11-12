import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

const AdminUsers = () => {
  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-4">(Mock) manage users here. This page is admin-only.</p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminUsers;
