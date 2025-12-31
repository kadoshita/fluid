import Head from 'next/head';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import type { DisplayPostData } from '../../@types/PostData';
import Header from '../../components/common/Header';
import MyNavbar from '../../components/common/Navbar';
import { ListTable } from '../../components/list';
import { TagService } from '../../lib/services';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { tag } = query;
  const tagPostData: DisplayPostData[] = await TagService.getLatest7dPostsByTag(tag as string);

  return {
    props: { tag, tagPostData },
  };
};

const Tag = ({ tag, tagPostData }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <Head>
        <title>fluid - {tag}</title>
        <link rel='icon' href='/favicon.ico' />
        <Header
          title={`fluid - ${tag}`}
          url={`https://fluid.sublimer.me/tag/${tag}`}
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
            <ListTable data={tagPostData}></ListTable>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
export default Tag;
