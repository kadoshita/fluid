import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../components/common/Navbar';
import { ListTable } from '../components/list';
import { DisplayPostData } from '../@types/PostData';
import Header from '../components/common/Header';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.HOST}/api/post`);
  const data: DisplayPostData[] = await res.json();
  return {
    props: {
      data
    }
  }
};

const Home = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <Head>
        <title>fluid - Home</title>
        <link rel="icon" href="/favicon.ico" />
        <Header title='fluid' url='https://fluid.sublimer.me'
          description='An application for Web clipping and sharing.'
          image='https://fluid.sublimer.me/logo.png'
          type='website'
          keywords='RSS,Portal,News,Technology'></Header>
      </Head>
      <MyNavbar></MyNavbar>
      <Container fluid>
        <Row>
          <Col>
            <ListTable data={data}></ListTable>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Home;