import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPurchases() {
      setLoading(true)
      try {
        const response = await axios.get('/api/purchases')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setPurchases(data)
      } finally {
        setLoading(false)
      }
    }
    fetchPurchases()
  }, [])

  return (
    <div>
      <SectionHeading title="Purchases" />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {purchases.map((pur) => (
            <li key={pur._id}>Supplier: {pur.supplier?.name || pur.supplier}, Total: {pur.total}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
