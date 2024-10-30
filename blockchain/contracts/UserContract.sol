// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserContract {
    struct UserDetails {
        string phoneNumber;
        string dateOfBirth;
        string fullName;
        string email;
        bool hasVoted;
        address accountAddress;
        bool loadedFee;
    }

    mapping(string => UserDetails) public users;

    // to check is phone number is registered
    mapping(string => bool) private registeredPhoneNumbers;

    // function to store user details. Indexed with public key to uniquely identify a user.
    function insertUserDetails(
        string memory _publicKey,
        string memory _phoneNumber,
        string memory _dateOfBirth,
        string memory _fullName,
        string memory _email,
        address _accountAddress,
        bool _hasVoted,
        bool _loadedFee
    ) public {
        users[_publicKey] = UserDetails({
            phoneNumber: _phoneNumber,
            dateOfBirth: _dateOfBirth,
            fullName: _fullName,
            hasVoted: _hasVoted,
            email: _email,
            accountAddress: _accountAddress,
            loadedFee: _loadedFee
        });
        registeredPhoneNumbers[_phoneNumber] = true;
    }

    // function to retrieve userdata. retrived based on public key
    function retrieveUserDetails(string memory _user) public view returns(string memory, 
        string memory,
        string memory, 
        bool,
        string memory,
        address,
        bool
    ) {
        UserDetails memory user = users[_user];
        return (
            user.phoneNumber, 
            user.dateOfBirth, 
            user.fullName, 
            user.hasVoted,
            user.email, 
            user.accountAddress,
            user.loadedFee
        ); 
    }

    // function to check the phone number details
    function isNumberRegistered(string memory _phoneNumber) public view returns (bool) {
        return registeredPhoneNumbers[_phoneNumber];
    }

    // function to update loaded fee
    function updateFeeStatus(string memory _publicKey, bool _loadedFee) public {
        users[_publicKey].loadedFee = _loadedFee;
    }

    // update voting status of user
    function updateVotingStatus(string memory _publicKey, bool _hasVoted) public {
        users[_publicKey].hasVoted = _hasVoted;
    }

}