import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true)
      try {
        const response = await axios.get('/api/invoices')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setInvoices(data)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  return (
    <div>
      <SectionHeading title="Invoices" />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv._id}>Customer: {inv.customer?.name || inv.customer}, Total: {inv.total}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
