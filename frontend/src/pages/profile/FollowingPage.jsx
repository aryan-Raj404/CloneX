import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa6";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFollow from "../../hooks/useFollow";
import toast from "react-hot-toast";

const FollowingPage = () => {
  const { username } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: user,
    isLoading,
  } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/user/following/${username}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { follow, isPending } = useFollow();

  const isMyProfile = authUser?.username === username;

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      {/* HEADER */}
      <div className="flex gap-10 px-4 py-2 items-center border-b border-gray-700 sticky top-0 bg-black bg-opacity-80 backdrop-blur z-10">
        <Link to={`/profile/${username}`}>
          <FaArrowLeft className="w-4 h-4 cursor-pointer hover:text-primary" />
        </Link>
        <div className="flex flex-col">
          <p className="font-bold text-lg">{user?.fullName}</p>
          <span className="text-sm text-slate-500">
            {user?.following?.length || 0} following
          </span>
        </div>
      </div>

      {/* FOLLOWING LIST */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : user?.following?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-slate-500 text-lg">Not following anyone</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {user.following.map((followingUser) => (
            <div
              key={followingUser._id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-gray-900/20 transition-colors"
            >
              <Link
                to={`/profile/${followingUser.username}`}
                className="flex gap-3 items-center flex-1 cursor-pointer"
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img
                      src={
                        followingUser.profileImg || "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold hover:underline">
                    {`${followingUser.fullName} ${followingUser.username === authUser.username ? " (You)" : ""}`}
                  </span>
                  <span className="text-sm text-slate-500">
                    @{followingUser.username}
                  </span>
                </div>
              </Link>

              {!isMyProfile &&
                authUser?.username !== followingUser.username && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() =>
                      follow({
                        id: followingUser._id,
                        username: followingUser.username,
                      })
                    }
                    disabled={isPending}
                  >
                    {isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : authUser?.following?.includes(followingUser._id) ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingPage;