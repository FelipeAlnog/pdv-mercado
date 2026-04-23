import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
 return(

  <div className='flex justify-center items-center'>
    <Link href={"/dashboard"}>
    <Button className=''>Acessar Dashboard</Button>
    </Link>
  </div>
 )
}
