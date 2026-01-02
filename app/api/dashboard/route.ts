import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get dashboard statistics
    const [
      totalStudents,
      totalUsers,
      totalPayments,
      totalTeachers,
      recentPayments,
    ] = await Promise.all([
      prisma.student.count({ where: { student_status: true } }),
      prisma.user.count({ where: { user_is_deleted: false } }),
      prisma.payment.count(),
      prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM employee WHERE employee_status = 1`.then((r: any) => r[0]?.count || 0),
      prisma.bulan.findMany({
        take: 10,
        orderBy: { bulan_input_date: 'desc' },
        include: {
          student: {
            select: {
              student_id: true,
              student_nis: true,
              student_full_name: true,
            },
          },
          payment: {
            include: {
              pos: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      totalStudents,
      totalUsers,
      totalPayments,
      totalTeachers,
      recentActivities: recentPayments.map((p: any) => 
        `Pembayaran ${p.student?.student_full_name || 'Siswa'} - ${p.payment?.pos?.pos_name || 'Payment'}`
      ),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
