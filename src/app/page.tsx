'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setItems(['Proposal A', 'Proposal B', 'Proposal C']);
    }
  }, [router]);

  const handleCreateProposal = () => {
    router.push('/create-proposal');
  };

  return (
      <Layout >
        <div className="container mt-5">
          <h2 className="mb-4">Your Proposals</h2>
          <ul className="list-group mb-4">
            {items.map((item, index) => (
              <li key={index} className="list-group-item">
                {item}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={handleCreateProposal}>
            Create Proposal
          </button>
        </div>
      </Layout>
  );
}
