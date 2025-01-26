import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

interface Todo {
  id: string
  title: string
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await supabase.from('todos').select()
      if (data) {
        setTodos(data)
      }
    }

    fetchTodos()
  }, [])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}