import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from '../components/Register/Register';
import Login from '../components/Login/Login';
import AdminLogin from '../components/AdminLogin/AdminLogin';
import Landing from '../components/Landing/Landing';
import ChooseCandidate from '../components/ChooseCandidate/ChooseCandidate';
import RegisterCandidate from '../components/RegisterCandidate/RegisterCandidate';
import ControlElection from '../components/ControlElection/ControlElection';
import Statistics from '../components/Statistics/Statistics';
import { AuthProvider } from '../contexts/AuthContext';

class AppRouter extends Component {
    render() {
        return (
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/chooseCandidate" element={<ChooseCandidate />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/registerCandidate" element={<RegisterCandidate />} />
                        <Route path="/admin/controlElection" element={<ControlElection />} />
                        <Route path="/admin/statistics" element={<Statistics />} />
                        {/* More routes can be added here */}
                    </Routes>
                </Router>
            </AuthProvider>
        );
    }
}

export default AppRouter;
