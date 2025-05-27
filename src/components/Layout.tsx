'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className='p-2 p-lg-5'>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
