import React, { useState, useEffect } from 'react';
import { Button, Form, Grid, Header, Segment, Modal, Message, MessageHeader, Menu, Container, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import '../../style/RegisterCandidate.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CandidateRegisteration } from '../../api/api';

const RegisterCandidate = () => {
  const [candidateName, setCandidateName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [errorState, setErrorState] = useState('');
  const [successState, setSuccessState] = useState(false);
  const [apiCall, setApiCall] = useState(false);
  const { user, setUser, admin, setAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (admin === null) {
      navigate('/');
    }
  }, [admin, navigate]);

  const handleRegister = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCandidateName(''); // Reset candidate name after confirmation
  };

  const handleRegisterConfirm = async () => {
    setModalOpen(false);
    try {
      setApiCall(true);
      const request = {
        "candidate_name": candidateName
      }
      const response = await CandidateRegisteration(request, admin['admin_account']);
      const responseMessage = await response.json();
      if (!response.ok) {
        setErrorState(responseMessage['message']);
      } else {
        setSuccessState(true);
      }
    } catch (err) {
      setErrorState('Something occurred please try again');
    } finally {
      setApiCall(false);
      setCandidateName('');
      setTimeout(() => {
        setErrorState('');
        setSuccessState(false);
      }, 4000);
    }
  }

  return (
    <div>
      <Menu fixed='top' inverted className="navbar">
        <Menu.Menu position='center'>
          <Menu.Item
            name='Voting Process'
            onClick={() => navigate('/')}
          >
            Home Page
          </Menu.Item>
          <Menu.Item
            name='Voting Process'
            onClick={() => navigate('/admin/controlElection')}
          >
            Voting Process
          </Menu.Item>
          <Menu.Item
            name='Statistics'
            onClick={() => navigate('/admin/statistics')}
          >
            Statistics
          </Menu.Item>
        </Menu.Menu>
    </Menu>

    <Grid
        textAlign='center'
        style={{ height: '100vh' }}
        verticalAlign='middle'
        columns={2}
    >

      <Grid.Column verticalAlign='middle' textAlign='center'>
          <Container text>
              <Image src='/blockchainico.webp' className='logoImage' centered />
              <Header as='h1' className='mainHeader'>
                Blockchain Decentralized Voting System
              </Header>
              <Header as="h2" color="teal" textAlign="subHeader">
                 Register a Candidate
               </Header>
          </Container>
      </Grid.Column>

      {/* Vertical Divider */}
      <div className="verticalDivider"></div>

      <Grid.Column verticalAlign='middle'>
      <Segment stacked className='formSegment'>
               <Form size="large" onSubmit={handleRegister}>
                 <Form.Input
                  fluid
                  icon="user"
                  iconPosition="left"
                  placeholder="Candidate Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className='customInput'
                />
                <Button loading={apiCall} fluid size="large" type="submit">
                  Register
                </Button>
              </Form>
              <Modal
                size="small"
                open={modalOpen}
                onClose={handleCloseModal}
                closeIcon
                className='customModal'
              >
                <Modal.Header>Confirm Candidate Registration</Modal.Header>
                <Modal.Content>
                  <p>Are you sure you want to register "{candidateName}" as a candidate?</p>
                </Modal.Content>
                <Modal.Actions>
                  <Button positive onClick={handleRegisterConfirm}>
                    Register
                  </Button>
                  <Button negative onClick={handleCloseModal}>
                    Cancel
                  </Button>
                </Modal.Actions>
              </Modal>
              {errorState.length !== 0 ?
                <Message negative>
                  <MessageHeader>Error</MessageHeader>
                  <p>{errorState}</p>
                </Message>
                : null
              }
              {
                successState ?
                  <Message success>
                    <MessageHeader>Registration Succesful</MessageHeader>
                    <p>The candidate is Registered</p>
                  </Message>
                  : null
              }
            </Segment>
      </Grid.Column>

    </Grid>
    </div>
  );
};

export default RegisterCandidate;
