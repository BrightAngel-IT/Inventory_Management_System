import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuppliers() {
      setLoading(true)
      try {
        const response = await axios.get('/api/suppliers')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setSuppliers(data)
      } finally {
        setLoading(false)
      }
    }
    fetchSuppliers()
  }, [])

  return (
    <div>
      <SectionHeading title="Suppliers" />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {suppliers.map((sup) => (
            <li key={sup._id}>{sup.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
