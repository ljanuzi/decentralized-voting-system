import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Grid, Header, Segment, Radio, Container, Message, MessageHeader, Image } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { VotingSetup, VoteApi } from '../../api/api';
import { ethers } from 'ethers';
import '../../style/ChooseCandidate.css';
import '../../style/DarkTheme.css';

const ChooseCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [initialError, setInitialErrorState] = useState('');
  const account = useRef('');
  const [provider, setProvider] = useState(null);
  const [errorState, setErrorState] = useState('');
  const [apiCall, SetApiCall] = useState(false);

  // redirect to landing page if user is not authorized through otp
  const initialCall = async() => {
      if(user === null){
        navigate('/');
      } else{
        const response = await VotingSetup(user['user_account']);
        const responseMessage = await response.json();
        if(!response.ok){
          setInitialErrorState(responseMessage['message']);
          setTimeout(()=>{
            navigate('/');
          }, 5000);
        } else {
          setCandidates(responseMessage['candidates']);
        }
      }
  }

  const voteFunction = async() => {
    SetApiCall(true);
    try{
        const request = {
          "candidate_id": selectedCandidate,
          "account_address": account.current
        }
        const response = await VoteApi(request, user['user_account']);
        const responseMessage = await response.json();
        SetApiCall(false);
        if(!response.ok){
            setErrorState(responseMessage['message']);
        } else {
            alert('Voted Successfully!!');
            setTimeout(()=>{
              navigate('/');
            },2000);
        }
    } catch(err){
        SetApiCall(false);
        setErrorState('Something occured please try again');
      }
  }

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account.current = accounts[0];
        const balance = await provider.getBalance(accounts[0]);
        if(balance === 0n){
          setErrorState('Not enough fund');
        } else{
          voteFunction();
        }
      } catch (error) {
        setErrorState('User denied account access');
      }
    } else {
      setErrorState('MetaMask is not installed');
    }
  };

  const initialMetaMask = () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }

  useEffect(()=>{
    initialCall();
    initialMetaMask();
  },[]);

  const handleChange = (e, { value }) => {
    setSelectedCandidate(value)
  };

  const handleSubmit = () => {
    setErrorState('');
    connectMetaMask();
  };

  return (
    <Grid
      textAlign='center'
      style={{ height: '100vh' }}
      verticalAlign='middle'
      columns={2}
    >
      <Grid.Column textAlign='left' style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '1000' }}>
        {/* Small square button with house icon to navigate back to landing page */}
        <Button icon size='large' style={{ width: '50px', height: '50px' }} onClick={() => navigate('/')}>
            <i className='home icon'></i>
        </Button>
      </Grid.Column>

      <Grid.Column verticalAlign='middle' textAlign='center'>
          <Container text>
              <Image src='/blockchainico.webp' className='logoImage' centered />
              <Header as='h1' className='mainHeader'>
                  Decentralized Voting System powered by Blockchain
              </Header>
          </Container>
      </Grid.Column>

      {/* Vertical Divider */}
      <div className="verticalDivider"></div>

      <Grid.Column verticalAlign='middle' className='customContainer' style={{ padding: '0 20px' }}>
        {
          initialError.length === 0 ?
            <Segment stacked className='formSegment'>
              <Header as='h2' className='subHeader' textAlign='center'>
                Choose Your Candidate
              </Header>
              <Form size="large" onSubmit={handleSubmit}>
                {candidates.map(candidate => (
                  <Form.Field key={candidate.id} className="radioOutline">
                    <Radio
                      label={candidate.name}
                      name="candidate"
                      value={candidate.id}
                      checked={selectedCandidate === candidate.id}
                      onChange={handleChange}
                    />
                  </Form.Field>
                ))}
                <Button loading={apiCall} color="teal" fluid size="large" type="submit">
                  Submit
                </Button>
                {
                  errorState.length !== 0 ?
                      <Message negative>
                          <MessageHeader>Error</MessageHeader>
                          <p>{errorState}</p>
                      </Message>
                    : null
                }
              </Form>
            </Segment>
          :
          <Message error>{initialError}. You will now be redirected</Message>
        }
      </Grid.Column>
    </Grid>
  );
};

export default ChooseCandidate;
