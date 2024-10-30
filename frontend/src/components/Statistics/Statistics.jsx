import React, { useEffect, useState } from 'react';
import { Grid, Header, Segment, Menu, Button } from 'semantic-ui-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import 'semantic-ui-css/semantic.min.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../style/Statistics.css';
import { VotingStatistics } from '../../api/api';

const Statistics = () => {
  const [data, setData] = useState([]);
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [errorState, setErrorState] = useState('');
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    if (admin === null) {
      navigate('/');
    } else {
      fetchData();
    }
  }, [admin]);

  const fetchData = async () => {
    try {
      const response = await VotingStatistics(admin['admin_account']);
      const responseMessage = await response.json();
      if (!response.ok) {
        setErrorState('Error fetching voting statistics');
      } else {
        setData(responseMessage);
      }
    } catch (error) {
      setErrorState('Error fetching voting statistics');
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div>
      <Menu fixed='top' inverted className="navbar">
        <Menu.Menu position='center'>
          <Menu.Item name='Home Page' onClick={() => navigate('/')}>Home Page</Menu.Item>
          <Menu.Item name='Voting Process' onClick={() => navigate('/admin/controlElection')}>Voting Process</Menu.Item>
          <Menu.Item name='Register Candidate' onClick={(_) => navigate('/admin/registerCandidate')}>Register Candidate</Menu.Item>
        </Menu.Menu>
      </Menu>

      <Grid style={{ height: '85vh' }} verticalAlign="middle" container stackable>
        <Grid.Row>
          <Grid.Column>
           <Header as="h2" textAlign="center" style={{ fontSize: '2em', fontWeight: 'bold', paddingTop: '2%' }}>
              Election Statistics
            </Header>
            <Segment>
              <div className="button-container">
                <Button onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}>
                  Switch to {chartType === 'bar' ? 'Pie Chart' : 'Bar Chart'}
                </Button>
              </div>
              {errorState ? (
                <p>{errorState}</p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'bar' ? (
                      <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fill: '#ffffff' }} />
                        <YAxis tick={{ fill: '#ffffff' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#4b5d67', border: 'none', color: '#ffffff' }} />
                        <Legend wrapperStyle={{ color: '#ffffff' }} />
                        <Bar dataKey="voteCount" fill="#c4aa33" />
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="voteCount"
                          nameKey="name"
                          outerRadius={150}
                          fill="#8884d8"
                          label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                          labelStyle={{ fill: '#ffffff' }}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getRandomColor()} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#4b5d67', border: 'none', color: '#ffffff' }} />
                        <Legend wrapperStyle={{ color: '#ffffff' }} />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

export default Statistics;
