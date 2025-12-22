'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Payment {
  paymentId: number
  paymentType: string
  paymentDate: string
  paymentAmount: number
  paymentStatus: string
  period: { periodName: string } | null
  pos: { posName: string } | null
  bebas: {
    student: { studentFullName: string } | null
  } | null
  bulan: {
    student: { studentFullName: string } | null
    month: { monthName: string } | null
  } | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [studentIdFilter, setStudentIdFilter] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [pagination.page, studentIdFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      let url = `/api/payments?page=${pagination.page}&limit=${pagination.limit}`
      if (studentIdFilter) {
        url += `&studentId=${studentIdFilter}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getStudentName = (payment: Payment) => {
    if (payment.bebas?.student) {
      return payment.bebas.student.studentFullName
    }
    if (payment.bulan?.student) {
      return payment.bulan.student.studentFullName
    }
    return '-'
  }

  const columns = [
    {
      key: 'paymentId',
      header: 'ID',
    },
    {
      key: 'paymentType',
      header: 'Tipe',
      render: (payment: Payment) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {payment.paymentType}
        </span>
      ),
    },
    {
      key: 'student',
      header: 'Siswa',
      render: (payment: Payment) => getStudentName(payment),
    },
    {
      key: 'period',
      header: 'Periode',
      render: (payment: Payment) => payment.period?.periodName || '-',
    },
    {
      key: 'pos',
      header: 'POS',
      render: (payment: Payment) => payment.pos?.posName || '-',
    },
    {
      key: 'month',
      header: 'Bulan',
      render: (payment: Payment) => payment.bulan?.month?.monthName || '-',
    },
    {
      key: 'paymentAmount',
      header: 'Jumlah',
      render: (payment: Payment) => formatCurrency(payment.paymentAmount || 0),
    },
    {
      key: 'paymentDate',
      header: 'Tanggal',
      render: (payment: Payment) => formatDate(payment.paymentDate),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (payment: Payment) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          payment.paymentStatus === 'paid' || payment.paymentStatus === '1'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payment.paymentStatus === 'paid' || payment.paymentStatus === '1' ? 'Lunas' : 'Belum Lunas'}
        </span>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Pembayaran</h2>
          </div>
          <div className="flex space-x-4">
            <Input
              label="Filter by Student ID"
              value={studentIdFilter}
              onChange={(e) => {
                setStudentIdFilter(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              placeholder="Masukkan Student ID"
              className="max-w-xs"
            />
            {studentIdFilter && (
              <Button
                variant="outline"
                onClick={() => {
                  setStudentIdFilter('')
                  setPagination({ ...pagination, page: 1 })
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            data={payments}
            loading={loading}
          />
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
