const API_URL = process.env.REACT_APP_BACKEND_URL;

export async function RegisterApi(request) {
    const response = await fetch(`${API_URL}/user/register`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function LoginApi(request) {
    const response = await fetch(`${API_URL}/user/login`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function OtpApi(request) {
    const response = await fetch(`${API_URL}/user/login/otp_authenticate`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function AdminLoginApi(request) {
    const response = await fetch(`${API_URL}/admin/login`,{
        method: "POST",
        body: request
    })
    return response;
}

export async function CandidateRegisteration(request, admin_account) {
    const response = await fetch(`${API_URL}/admin/regCandidate`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': admin_account
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function SetElectionStatus(request, admin_account) {
    const response = await fetch(`${API_URL}/admin/setElectionStatus`,{
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': admin_account
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function VotingSetup(user_account) {
    const response = await fetch(`${API_URL}/user/voteSetup`,{
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': user_account
        }
    })
    return response;
}

export async function VoteApi(request, user_account) {
    const response = await fetch(`${API_URL}/user/voteService`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': user_account
        },
        body: JSON.stringify(request)
    })
    return response;
}

export async function VotingStatistics(admin_account) {
    const response = await fetch(`${API_URL}/admin/getVotingStatistics`,{
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': admin_account
        }
    })
    return response;
}
