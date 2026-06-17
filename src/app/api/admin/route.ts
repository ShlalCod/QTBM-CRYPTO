import { NextResponse } from 'next/server';

export async function GET() {
  // Mock admin dashboard stats
  const stats = {
    totalUsers: 284592,
    totalUsersGrowth: 12.5,
    volume24h: 1820000000,
    volume24hGrowth: 8.3,
    activeOrders: 42891,
    activeOrdersChange: -2.1,
    platformRevenue: 4200000,
    platformRevenueGrowth: 18.7,
  };

  const users = [
    { id: '1', name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', kycStatus: 'verified', role: 'user', status: 'active', lastActive: '2 min ago' },
    { id: '2', name: 'Sarah Chen', email: 'sarah.chen@example.com', kycStatus: 'pending', role: 'user', status: 'active', lastActive: '15 min ago' },
    { id: '3', name: 'Mohammed Hassan', email: 'mohammed@example.com', kycStatus: 'verified', role: 'user', status: 'suspended', lastActive: '3 days ago' },
    { id: '4', name: 'Elena Popov', email: 'elena.p@example.com', kycStatus: 'rejected', role: 'user', status: 'active', lastActive: '1 hour ago' },
    { id: '5', name: 'James Wilson', email: 'j.wilson@example.com', kycStatus: 'verified', role: 'moderator', status: 'active', lastActive: '5 min ago' },
    { id: '6', name: 'Yuki Tanaka', email: 'yuki.t@example.com', kycStatus: 'pending', role: 'user', status: 'active', lastActive: '30 min ago' },
  ];

  const kycQueue = [
    { id: 'K1', name: 'Fatima Al-Zahra', docType: 'National ID + Selfie', submittedDate: '2024-01-15', country: 'Saudi Arabia' },
    { id: 'K2', name: 'Chen Wei Ming', docType: 'Passport + Proof of Address', submittedDate: '2024-01-15', country: 'Singapore' },
    { id: 'K3', name: 'Alex Petrov', docType: 'Driver License + Selfie', submittedDate: '2024-01-14', country: 'Russia' },
    { id: 'K4', name: 'Maria Garcia', docType: 'National ID + Selfie', submittedDate: '2024-01-14', country: 'Spain' },
  ];

  const systemHealth = {
    apiUptime: 99.97,
    avgResponseTime: 42,
    wsConnections: 12847,
    dbSize: 78,
  };

  const auditLogs = [
    { id: 'AL1', timestamp: '2024-01-15 12:30:15', admin: 'Admin_QTBM', action: 'Suspend User', target: 'mohammed@example.com', result: 'success' },
    { id: 'AL2', timestamp: '2024-01-15 12:15:08', admin: 'Admin_QTBM', action: 'Approve KYC', target: 'ahmed@example.com', result: 'success' },
    { id: 'AL3', timestamp: '2024-01-15 11:45:22', admin: 'Mod_James', action: 'Flag Order', target: 'Order #FO2', result: 'success' },
  ];

  const announcements = [
    { id: 'ANN-001', title: 'Scheduled Maintenance - Jan 20', type: 'system', date: '2024-01-15', status: 'active' },
    { id: 'ANN-002', title: 'New Trading Pairs Available', type: 'promotion', date: '2024-01-14', status: 'active' },
    { id: 'ANN-003', title: 'Enhanced Security Measures', type: 'security', date: '2024-01-13', status: 'active' },
    { id: 'ANN-004', title: 'QTBM Earn - 12% APY on BNB', type: 'promotion', date: '2024-01-12', status: 'expired' },
  ];

  return NextResponse.json({
    stats,
    users,
    kycQueue,
    systemHealth,
    auditLogs,
    announcements,
  });
}
