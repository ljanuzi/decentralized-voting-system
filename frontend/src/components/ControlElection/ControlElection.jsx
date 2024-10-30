import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Segment, Modal, Message, MessageHeader, Menu, Container, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import '../../style/ControlElection.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SetElectionStatus } from '../../api/api';

const ControlElection = () => {
  const { user, setUser, admin, setAdmin } = useAuth();
  const [ disableStart, setDisableStart ] = useState(false);
  const [ disableStop, setDisableStop ] = useState(false);
  const [errorState, setErrorState] = useState('');
  const [successState, setSuccessState] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    if(admin === null){
      navigate('/');
    }
  },[]);

  const handleStartElection = async() => {
     setErrorState('');
     setSuccessState('');
     try{
        setDisableStart(true);
        const request = {
          "status": 1
        }
        const response = await SetElectionStatus(request, admin['admin_account']);
        if(!response.ok){
          const responseMessage = await response.json();
          setErrorState(responseMessage['message']);
        } else {
          setSuccessState('Election Started Successfully');
        }
     } catch(err){
        setErrorState('Something occured please try again');
     } finally{
        setDisableStart(false);
     }
  };

  const handleStopElection = async() => {
     setErrorState('');
     setSuccessState('');
     try{
        setDisableStop(true);
        const request = {
          "status": 2
        }
        const response = await SetElectionStatus(request, admin['admin_account']);
        if(!response.ok){
          const responseMessage = await response.json();
          setErrorState(responseMessage['message']);
        } else {
          setSuccessState('Election Stopped Successfully');
        }
     } catch(err){
        setErrorState('Something occured please try again');
     } finally{
        setDisableStop(false);
     }
  };

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
              name='Register Candidate'
              onClick={(_) => navigate('/admin/registerCandidate')}
            >
              Register Candidate
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
              <Header as='h2' className='subHeader' >
              Election Control Panel
            </Header>
          </Container>
      </Grid.Column>

      {/* Vertical Divider */}
      <div className="verticalDivider"></div>

      <Grid.Column verticalAlign='middle'>
      <Grid.Row>
          <Grid.Column className='controlGrid'>
            <Button positive loading={disableStart} disabled={disableStop} onClick={handleStartElection}>
              Start Election
            </Button>
            <Button negative loading={disableStop} disabled={disableStart} onClick={handleStopElection}>
              Stop Election
            </Button>
            {errorState.length !== 0 ?
              <div style={{display:'flex', justifyContent: 'center', marginTop: '20px'}}>
                <Message negative>
                    <MessageHeader>Error</MessageHeader>
                    <p>{errorState}</p>
                </Message>
              </div>
              : null
            }
            {
              successState.length !== 0 ?
              <div style={{display:'flex', justifyContent: 'center', marginTop: '20px'}}>
                <Message success>
                    <MessageHeader>Success</MessageHeader>
                    <p>{successState}</p>
                </Message>
              </div>
              : null
            }
          </Grid.Column>
        </Grid.Row>
      </Grid.Column>
    </Grid>
    </div>
  );
};

export default ControlElection;