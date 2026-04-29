import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true)
      try {
        const response = await axios.get('/api/customers')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setCustomers(data)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  return (
    <div>
      <SectionHeading title="Customers" />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {(Array.isArray(customers) ? customers : []).map((cus) => (
            <li key={cus._id}>{cus.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
