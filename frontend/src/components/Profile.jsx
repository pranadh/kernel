import React from "react";

const Profile = ({ user }) => {
  return (
    <div className="max-w-md mx-auto mt-10 border p-4 rounded">
      <h2 className="text-2xl font-bold">Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Handle:</strong> @{user.handle}</p>
    </div>
  );
};

export default Profile;