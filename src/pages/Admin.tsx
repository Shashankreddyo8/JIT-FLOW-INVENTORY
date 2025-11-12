import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

const AdminContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">This area is protected and visible only to admins.</p>
    </div>
  );
};

const Admin = () => {
  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <AdminContent />
      </Layout>
    </ProtectedRoute>
  );
};

export default Admin;
