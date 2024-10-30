// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    struct CandidateWithoutVotes {
        uint id;
        string name;
    }
    mapping(uint => Candidate) public candidates;
    uint[] public candidateIds;
    uint public candidateCount;
    uint public votingStatus = 0; // 0 indicates voting is closed, 1 indicates it is open, 2 indicates stopped

    // Function to add candidates
    function addCandidate(string memory _name) public {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        candidateIds.push(candidateCount);
    }

    // Function to open or close voting
    function setVotingStatus(uint _status) public {
        require(
            _status == 0 || _status == 1 || _status == 2,
            "Invalid status; must be 0 (closed) or 1 (open) or 2(stop)."
        );
        votingStatus = _status;
    }

    // Function to get the current voting status
    function getVotingStatus() public view returns (uint) {
        return votingStatus;
    }

    // Function to vote for a candidate
    function vote(uint _candidateId) public {
        require(votingStatus == 1, "Voting is not open.");
        require(
            _candidateId > 0 && _candidateId <= candidateCount,
            "Invalid candidate ID."
        );
        candidates[_candidateId].voteCount++;
    }

    // Function to get the name and ID of the candidates by iterating over the candidateIds
    function getAllCandidates() public view returns (CandidateWithoutVotes[] memory) {
        CandidateWithoutVotes[] memory allCandidates = new CandidateWithoutVotes[](candidateCount);
        for (uint i = 0; i < candidateIds.length; i++) {
            allCandidates[i].id = candidates[candidateIds[i]].id;
            allCandidates[i].name = candidates[candidateIds[i]].name;
        }
        return allCandidates;
    }

    // Function to return all candidates' details: ID, name, and vote count
    function getAllCandidatesVoteCount() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint i = 0; i < candidateIds.length; i++) {
            allCandidates[i] = candidates[candidateIds[i]];
        }
        return allCandidates;
    }
}
