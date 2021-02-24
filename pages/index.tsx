import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavbar from '../components/common/Navbar';
import { ListTable } from '../components/list';
import { PostData } from '../@types/PostData';

const ListData: PostData[] = [
  { id: 1, title: 'Google', url: 'https://www.google.com/', added_at: '2021/2/24 17:41:27' },
  { id: 2, title: 'mstdn.sublimer.me - あすてろいどん', url: 'https://mstdn.sublimer.me/about', added_at: '2021/2/24 17:41:40' }
];

const Home = () => {
  return (
    <div>
      <MyNavbar></MyNavbar>
      <Container fluid>
        <Row>
          <Col>
            <ListTable data={ListData}></ListTable>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Home;