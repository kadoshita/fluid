import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../../components/common/Header';
import MyNavbar from '../../components/common/Navbar';
import { CategoryService } from '../../lib/services';

export const getServerSideProps: GetServerSideProps = async () => {
  const categories: string[] = await CategoryService.getAllCategories();
  return {
    props: {
      categories,
    },
  };
};
const Category = ({ categories }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <Head>
        <title>fluid - Category</title>
        <link rel='icon' href='/favicon.ico' />
        <Header
          title={`fluid - Category`}
          url={`https://fluid.sublimer.me/category`}
          description='An application for Web clipping and sharing.'
          image='https://fluid.sublimer.me/logo.png'
          type='article'
          keywords='RSS,Portal,News,Technology'
        ></Header>
      </Head>
      <MyNavbar></MyNavbar>
      <Container fluid>
        <Row>
          <Col>
            <ul>
              {categories.map((c, i) => (
                <li key={i}>
                  <Link href={`/category/${c}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Category;
