import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { VscVerifiedFilled } from "react-icons/vsc";
import axios from "../api";
import UserBadges from "./UserBadges";
import UsernameDisplay from "./UsernameDisplay";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users/all");
        // Remove the mapping since the API already includes avatar URLs
        setUsers(data);
      } catch (error) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  if (!users?.length) {
    return (
      <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg p-8 border border-white/5">
        <div className="flex flex-col items-center justify-center text-text-secondary space-y-3">
          <FaUserFriends className="w-12 h-12 opacity-50" />
          <p className="text-lg font-medium">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5">
      <div className="px-6 py-4 border-b border-white/5 flex items-center">
        <FaUserFriends className="w-6 h-6 text-text-secondary mr-3" />
        <h3 className="text-xl font-semibold text-text-primary">Users</h3>
        <span className="ml-auto text-text-secondary">
          Total: {users.length}
        </span>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="p-3 space-y-2">
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/u/${user.handle}`}
              className="block group"
            >
              <div className="p-4 rounded-lg bg-surface-2/50 hover:bg-surface-2 border border-white/5 
                            transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5">
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary-hover/10 
                                      flex items-center justify-center
                                      group-hover:from-primary/20 group-hover:to-primary-hover/20 transition-all duration-300">
                          <span className="text-xl font-semibold text-text-primary group-hover:text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-lg group-hover:text-primary transition-colors">
                          {user.username}
                        </span>
                        {user.isVerified && (
                          <VscVerifiedFilled className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="text-sm text-text-secondary group-hover:text-text-primary/75 transition-colors">
                        @{user.handle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <UserBadges 
                      roles={user.roles} 
                      isVerified={false}
                      disableHover={true}
                      disableTooltip={true}
                    />
                    <div className="text-text-secondary text-sm">
                      {user.followers?.length || 0} followers
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;