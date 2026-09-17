import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <Button><Link to="/login">Login</Link></Button>
  )
}

export default Home