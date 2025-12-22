'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface Student {
  studentId: number
  studentNis: string
  studentNisn: string
  studentFullName: string
  studentGender: string
  class: { className: string } | null
  major: { majorsName: string } | null
  studentStatus: boolean
}

interface Class {
  classId: number
  className: string
}

interface Major {
  majorsId: number
  majorsName: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [formData, setFormData] = useState({
    studentNis: '',
    studentNisn: '',
    studentPassword: '',
    studentFullName: '',
    studentGender: '',
    classClassId: '',
    majorsMajorsId: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchStudents()
    fetchClasses()
    fetchMajors()
  }, [pagination.page])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/students?page=${pagination.page}&limit=${pagination.limit}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes)
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchMajors = async () => {
    try {
      const res = await fetch('/api/majors')
      if (res.ok) {
        const data = await res.json()
        setMajors(data.majors)
      }
    } catch (error) {
      console.error('Failed to fetch majors:', error)
    }
  }

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        studentNis: student.studentNis || '',
        studentNisn: student.studentNisn || '',
        studentPassword: '',
        studentFullName: student.studentFullName || '',
        studentGender: student.studentGender || '',
        classClassId: student.class ? String((student as any).classClassId) : '',
        majorsMajorsId: student.major ? String((student as any).majorsMajorsId) : '',
      })
    } else {
      setEditingStudent(null)
      setFormData({
        studentNis: '',
        studentNisn: '',
        studentPassword: '',
        studentFullName: '',
        studentGender: '',
        classClassId: '',
        majorsMajorsId: '',
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingStudent(null)
    setFormData({
      studentNis: '',
      studentNisn: '',
      studentPassword: '',
      studentFullName: '',
      studentGender: '',
      classClassId: '',
      majorsMajorsId: '',
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.studentNis) newErrors.studentNis = 'NIS wajib diisi'
    if (!formData.studentFullName) newErrors.studentFullName = 'Nama lengkap wajib diisi'
    if (!editingStudent && !formData.studentPassword) newErrors.studentPassword = 'Password wajib diisi'
    if (!formData.studentGender) newErrors.studentGender = 'Jenis kelamin wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const url = editingStudent
        ? `/api/students/${editingStudent.studentId}`
        : '/api/students'
      const method = editingStudent ? 'PUT' : 'POST'

      const body: any = { ...formData }
      if (editingStudent && !body.studentPassword) {
        delete body.studentPassword
      }
      if (body.classClassId) body.classClassId = parseInt(body.classClassId)
      if (body.majorsMajorsId) body.majorsMajorsId = parseInt(body.majorsMajorsId)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        handleCloseModal()
        fetchStudents()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      console.error('Failed to save student:', error)
      alert('Gagal menyimpan data')
    }
  }

  const handleDelete = async (student: Student) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${student.studentFullName}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/students/${student.studentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchStudents()
      } else {
        alert('Gagal menghapus data')
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
      alert('Gagal menghapus data')
    }
  }

  const columns = [
    {
      key: 'studentNis',
      header: 'NIS',
    },
    {
      key: 'studentNisn',
      header: 'NISN',
    },
    {
      key: 'studentFullName',
      header: 'Nama Lengkap',
    },
    {
      key: 'studentGender',
      header: 'Jenis Kelamin',
      render: (student: Student) => student.studentGender === 'L' ? 'Laki-laki' : 'Perempuan',
    },
    {
      key: 'class',
      header: 'Kelas',
      render: (student: Student) => student.class?.className || '-',
    },
    {
      key: 'major',
      header: 'Jurusan',
      render: (student: Student) => student.major?.majorsName || '-',
    },
    {
      key: 'studentStatus',
      header: 'Status',
      render: (student: Student) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          student.studentStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {student.studentStatus ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Siswa</h2>
          <Button onClick={() => handleOpenModal()}>
            + Tambah Siswa
          </Button>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            data={students}
            loading={loading}
            actions={(student) => (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenModal(student)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(student)
                  }}
                >
                  Hapus
                </Button>
              </div>
            )}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingStudent ? 'Update' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIS"
              value={formData.studentNis}
              onChange={(e) => setFormData({ ...formData, studentNis: e.target.value })}
              error={errors.studentNis}
              required
            />
            <Input
              label="NISN"
              value={formData.studentNisn}
              onChange={(e) => setFormData({ ...formData, studentNisn: e.target.value })}
              error={errors.studentNisn}
            />
          </div>
          <Input
            label="Nama Lengkap"
            value={formData.studentFullName}
            onChange={(e) => setFormData({ ...formData, studentFullName: e.target.value })}
            error={errors.studentFullName}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              value={formData.studentGender}
              onChange={(e) => setFormData({ ...formData, studentGender: e.target.value })}
              error={errors.studentGender}
              options={[
                { value: '', label: 'Pilih Jenis Kelamin' },
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' },
              ]}
              required
            />
            {!editingStudent && (
              <Input
                label="Password"
                type="password"
                value={formData.studentPassword}
                onChange={(e) => setFormData({ ...formData, studentPassword: e.target.value })}
                error={errors.studentPassword}
                required
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kelas"
              value={formData.classClassId}
              onChange={(e) => setFormData({ ...formData, classClassId: e.target.value })}
              options={[
                { value: '', label: 'Pilih Kelas' },
                ...classes.map((c) => ({ value: String(c.classId), label: c.className || '' })),
              ]}
            />
            <Select
              label="Jurusan"
              value={formData.majorsMajorsId}
              onChange={(e) => setFormData({ ...formData, majorsMajorsId: e.target.value })}
              options={[
                { value: '', label: 'Pilih Jurusan' },
                ...majors.map((m) => ({ value: String(m.majorsId), label: m.majorsName || '' })),
              ]}
            />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}
