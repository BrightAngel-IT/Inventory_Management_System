import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { SectionHeading } from '../../components/SectionHeading'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true)
      try {
        const response = await axios.get('/api/categories')
        let data = response.data
        if (!Array.isArray(data)) data = []
        setCategories(data)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div>
      <SectionHeading title="Categories" />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat._id}>{cat.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
