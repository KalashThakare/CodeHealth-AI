// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { AuthGuard } from "@/services/AuthGuard";
// import { useAuthStore } from "@/store/authStore";
// import { useTeamStore } from "@/store/teamStore";
// import {
//   ArrowLeft,
//   Users,
//   Mail,
//   Trash2,
//   LogOut,
//   Plus,
//   Crown,
//   Shield,
//   User,
//   Send,
//   X,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import Link from "next/link";


// const TeamDetailPage = () => {
//   const router = useRouter();
//   const params = useParams();
//   const teamId = params.id as string;
//   const { authUser } = useAuthStore();

//   const {
//     teams,
//     members,
//     invites,
//     loading,
//     error,
//     fetchTeamMembers,
//     fetchTeamInvites,
//     sendInvite,
//     updateMemberRole,
//     removeMember,
//     deleteTeam,
//     leaveTeam,
//     clearError,
//     teamMembersLoaded,
//     teamInvitesLoaded,
//   } = useTeamStore();

//   const [showInviteForm, setShowInviteForm] = useState(false);
//   const [inviteForm, setInviteForm] = useState({
//     email: "",
//     role: "Member" as "Owner" | "Manager" | "Member",
//   });
//   const [actionLoading, setActionLoading] = useState<string | null>(null);

//   const currentTeam = teams.find((t) => t.id === teamId);
//   const isOwner = currentTeam?.userId === authUser?.id;

//   useEffect(() => {
//     if (authUser && teamId) {
//       // Only fetch if not already loaded
//       if (!teamMembersLoaded[teamId]) {
//         fetchTeamMembers(teamId);
//       }
//       if (!teamInvitesLoaded[teamId]) {
//         fetchTeamInvites(teamId);
//       }
//     }
//   }, [
//     authUser,
//     teamId,
//     fetchTeamMembers,
//     fetchTeamInvites,
//     teamMembersLoaded,
//     teamInvitesLoaded,
//   ]);


//   const handleSendInvite = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inviteForm.email.trim()) return;

//     setActionLoading("invite");
//     const success = await sendInvite(teamId, inviteForm.email, inviteForm.role);
//     setActionLoading(null);

//     if (success) {
//       setInviteForm({ email: "", role: "Member" });
//       setShowInviteForm(false);
//       fetchTeamInvites(teamId); // Refresh invites
//     }
//   };

//   const handleUpdateRole = async (memberId: string, newRole: string) => {
//     if (
//       !confirm(
//         `Are you sure you want to change this member's role to ${newRole}?`
//       )
//     ) {
//       return;
//     }

//     setActionLoading(`role-${memberId}`);
//     const success = await updateMemberRole(teamId, memberId, newRole);
//     setActionLoading(null);

//     if (success) {
//       fetchTeamMembers(teamId); // Refresh members
//     }
//   };

//   const handleRemoveMember = async (memberId: string) => {
//     if (
//       !confirm("Are you sure you want to remove this member from the team?")
//     ) {
//       return;
//     }

//     setActionLoading(`remove-${memberId}`);
//     const success = await removeMember(teamId, memberId);
//     setActionLoading(null);

//     if (success) {
//       fetchTeamMembers(teamId); // Refresh members
//     }
//   };

//   const handleDeleteTeam = async () => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this team? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     setActionLoading("delete");
//     const success = await deleteTeam(teamId);
//     setActionLoading(null);

//     if (success) {
//       router.push("/dashboard/teams");
//     }
//   };

//   const handleLeaveTeam = async () => {
//     if (!confirm("Are you sure you want to leave this team?")) {
//       return;
//     }

//     setActionLoading("leave");
//     const success = await leaveTeam(teamId);
//     setActionLoading(null);

//     if (success) {
//       router.push("/dashboard/teams");
//     }
//   };

//   const getRoleIcon = (role: string) => {
//     switch (role) {
//       case "Owner":
//         return <Crown className="w-4 h-4 text-yellow-500" />;
//       case "Manager":
//         return <Shield className="w-4 h-4 text-blue-500" />;
//       default:
//         return <User className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   if (!authUser || !currentTeam) {
//     return null;
//   }

//   return (
//     <div
//       className="min-h-screen p-6"
//       style={{ backgroundColor: "var(--color-bg)" }}
//     >
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/dashboard/teams"
//             className="inline-flex items-center space-x-2 mb-4 text-sm hover:opacity-80 transition-opacity"
//             style={{ color: "var(--color-fg-secondary)" }}
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span>Back to Teams</span>
//           </Link>

//           <div className="flex items-start justify-between">
//             <div>
//               <div className="flex items-center space-x-3 mb-2">
//                 <h1
//                   className="text-3xl font-bold"
//                   style={{ color: "var(--color-fg)" }}
//                 >
//                   {currentTeam.name}
//                 </h1>
//                 {isOwner && (
//                   <span
//                     className="px-2 py-1 text-xs rounded-full"
//                     style={{
//                       backgroundColor: "var(--color-primary)",
//                       color: "white",
//                     }}
//                   >
//                     Owner
//                   </span>
//                 )}
//               </div>
//               <p
//                 className="text-lg mb-4"
//                 style={{ color: "var(--color-fg-secondary)" }}
//               >
//                 {currentTeam.description}
//               </p>
//               <div className="flex items-center space-x-4 text-sm">
//                 <div className="flex items-center space-x-1">
//                   <Users
//                     className="w-4 h-4"
//                     style={{ color: "var(--color-fg-secondary)" }}
//                   />
//                   <span style={{ color: "var(--color-fg-secondary)" }}>
//                     {members.length} members
//                   </span>
//                 </div>
//                 <div style={{ color: "var(--color-fg-secondary)" }}>
//                   Created {new Date(currentTeam.createdAt).toLocaleDateString()}
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               {isOwner && (
//                 <button
//                   onClick={() => setShowInviteForm(true)}
//                   className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
//                   style={{
//                     backgroundColor: "var(--color-primary)",
//                     color: "white",
//                   }}
//                 >
//                   <Plus className="w-4 h-4" />
//                   <span>Invite Member</span>
//                 </button>
//               )}

//               {isOwner ? (
//                 <button
//                   onClick={handleDeleteTeam}
//                   disabled={actionLoading === "delete"}
//                   className="flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium transition-colors hover:bg-red-50"
//                   style={{
//                     color: "#ef4444",
//                     borderColor: "#ef4444",
//                   }}
//                 >
//                   {actionLoading === "delete" ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Trash2 className="w-4 h-4" />
//                   )}
//                   <span>Delete Team</span>
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleLeaveTeam}
//                   disabled={actionLoading === "leave"}
//                   className="flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium transition-colors hover:bg-red-50"
//                   style={{
//                     color: "#ef4444",
//                     borderColor: "#ef4444",
//                   }}
//                 >
//                   {actionLoading === "leave" ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <LogOut className="w-4 h-4" />
//                   )}
//                   <span>Leave Team</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div
//             className="mb-6 p-4 rounded-lg border flex items-center space-x-3"
//             style={{
//               backgroundColor: "var(--color-card)",
//               borderColor: "#ef4444",
//               color: "#ef4444",
//             }}
//           >
//             <AlertCircle className="w-5 h-5" />
//             <span>{error}</span>
//             <button
//               onClick={clearError}
//               className="ml-auto text-sm underline hover:no-underline"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Members Section */}
//           <div className="lg:col-span-2">
//             <div
//               className="rounded-lg border"
//               style={{
//                 backgroundColor: "var(--color-card)",
//                 borderColor: "var(--color-border)",
//               }}
//             >
//               <div
//                 className="p-6 border-b"
//                 style={{ borderColor: "var(--color-border)" }}
//               >
//                 <h2
//                   className="text-xl font-semibold"
//                   style={{ color: "var(--color-fg)" }}
//                 >
//                   Team Members ({members.length})
//                 </h2>
//               </div>

//               <div className="p-6">
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2
//                       className="w-8 h-8 animate-spin"
//                       style={{ color: "var(--color-primary)" }}
//                     />
//                   </div>
//                 ) : members.length === 0 ? (
//                   <div className="text-center py-8">
//                     <Users
//                       className="w-12 h-12 mx-auto mb-4"
//                       style={{ color: "var(--color-fg-secondary)" }}
//                     />
//                     <p
//                       className="text-lg font-medium mb-2"
//                       style={{ color: "var(--color-fg)" }}
//                     >
//                       No members yet
//                     </p>
//                     <p style={{ color: "var(--color-fg-secondary)" }}>
//                       Invite people to join your team
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {members.map((member) => (
//                       <div
//                         key={member.id}
//                         className="flex items-center justify-between p-4 rounded-lg border"
//                         style={{
//                           backgroundColor: "var(--color-bg)",
//                           borderColor: "var(--color-border)",
//                         }}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-bold text-sm">
//                               {member.name?.charAt(0).toUpperCase() ||
//                                 member.email?.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
//                           <div>
//                             <p
//                               className="font-medium"
//                               style={{ color: "var(--color-fg)" }}
//                             >
//                               {member.name || member.email.split("@")[0]}
//                             </p>
//                             <p
//                               className="text-sm"
//                               style={{ color: "var(--color-fg-secondary)" }}
//                             >
//                               {member.email}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-3">
//                           <div className="flex items-center space-x-2">
//                             {getRoleIcon(member.role)}
//                             <span
//                               className="text-sm font-medium"
//                               style={{ color: "var(--color-fg)" }}
//                             >
//                               {member.role}
//                             </span>
//                           </div>

//                           {isOwner && member.email !== authUser?.email && (
//                             <div className="flex items-center space-x-2">
//                               <select
//                                 value={member.role}
//                                 onChange={(e) =>
//                                   handleUpdateRole(member.id, e.target.value)
//                                 }
//                                 disabled={actionLoading === `role-${member.id}`}
//                                 className="text-sm px-2 py-1 rounded border"
//                                 style={{
//                                   backgroundColor: "var(--color-card)",
//                                   borderColor: "var(--color-border)",
//                                   color: "var(--color-fg)",
//                                 }}
//                               >
//                                 <option value="Member">Member</option>
//                                 <option value="Manager">Manager</option>
//                               </select>

//                               <button
//                                 onClick={() => handleRemoveMember(member.id)}
//                                 disabled={
//                                   actionLoading === `remove-${member.id}`
//                                 }
//                                 className="p-1 rounded hover:bg-red-50 transition-colors"
//                                 style={{ color: "#ef4444" }}
//                               >
//                                 {actionLoading === `remove-${member.id}` ? (
//                                   <Loader2 className="w-4 h-4 animate-spin" />
//                                 ) : (
//                                   <X className="w-4 h-4" />
//                                 )}
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Invites Section */}
//           <div>
//             <div
//               className="rounded-lg border"
//               style={{
//                 backgroundColor: "var(--color-card)",
//                 borderColor: "var(--color-border)",
//               }}
//             >
//               <div
//                 className="p-6 border-b"
//                 style={{ borderColor: "var(--color-border)" }}
//               >
//                 <h3
//                   className="text-lg font-semibold"
//                   style={{ color: "var(--color-fg)" }}
//                 >
//                   Pending Invites ({invites.length})
//                 </h3>
//               </div>

//               <div className="p-6">
//                 {invites.length === 0 ? (
//                   <div className="text-center py-6">
//                     <Mail
//                       className="w-8 h-8 mx-auto mb-3"
//                       style={{ color: "var(--color-fg-secondary)" }}
//                     />
//                     <p
//                       className="text-sm"
//                       style={{ color: "var(--color-fg-secondary)" }}
//                     >
//                       No pending invites
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {invites.map((invite) => (
//                       <div
//                         key={invite.id}
//                         className="p-3 rounded-lg border"
//                         style={{
//                           backgroundColor: "var(--color-bg)",
//                           borderColor: "var(--color-border)",
//                         }}
//                       >
//                         <p
//                           className="font-medium text-sm"
//                           style={{ color: "var(--color-fg)" }}
//                         >
//                           {invite.email}
//                         </p>
//                         <p
//                           className="text-xs mt-1"
//                           style={{ color: "var(--color-fg-secondary)" }}
//                         >
//                           Role: {invite.role}
//                         </p>
//                         <p
//                           className="text-xs"
//                           style={{ color: "var(--color-fg-secondary)" }}
//                         >
//                           Expires:{" "}
//                           {new Date(invite.expiresAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Invite Form Modal */}
//         {showInviteForm && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div
//               className="fixed inset-0 backdrop-blur-sm"
//               style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//               onClick={() => setShowInviteForm(false)}
//             />
//             <div
//               className="relative rounded-lg shadow-lg w-full max-w-md p-6"
//               style={{
//                 backgroundColor: "var(--color-card)",
//                 border: "1px solid var(--color-border)",
//               }}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <h3
//                   className="text-lg font-semibold"
//                   style={{ color: "var(--color-fg)" }}
//                 >
//                   Invite Team Member
//                 </h3>
//                 <button
//                   onClick={() => setShowInviteForm(false)}
//                   className="p-2 rounded-lg transition-colors"
//                   style={{ color: "var(--color-fg-secondary)" }}
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <form onSubmit={handleSendInvite} className="space-y-4">
//                 <div>
//                   <label
//                     className="block text-sm font-medium mb-2"
//                     style={{ color: "var(--color-fg)" }}
//                   >
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     value={inviteForm.email}
//                     onChange={(e) =>
//                       setInviteForm((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     placeholder="Enter email address"
//                     className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
//                     style={{
//                       backgroundColor: "var(--color-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-fg)",
//                     }}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label
//                     className="block text-sm font-medium mb-2"
//                     style={{ color: "var(--color-fg)" }}
//                   >
//                     Role
//                   </label>
//                   <select
//                     value={inviteForm.role}
//                     onChange={(e) =>
//                       setInviteForm((prev) => ({
//                         ...prev,
//                         role: e.target.value as any,
//                       }))
//                     }
//                     className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
//                     style={{
//                       backgroundColor: "var(--color-bg)",
//                       borderColor: "var(--color-border)",
//                       color: "var(--color-fg)",
//                     }}
//                   >
//                     <option value="Member">Member</option>
//                     <option value="Manager">Manager</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center space-x-3 pt-4">
//                   <button
//                     type="submit"
//                     disabled={
//                       actionLoading === "invite" || !inviteForm.email.trim()
//                     }
//                     className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     style={{
//                       backgroundColor: "var(--color-primary)",
//                       color: "white",
//                     }}
//                   >
//                     {actionLoading === "invite" ? (
//                       <>
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                         <span>Sending...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Send className="w-4 h-4" />
//                         <span>Send Invite</span>
//                       </>
//                     )}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setShowInviteForm(false)}
//                     className="px-4 py-2 rounded-lg border font-medium transition-colors"
//                     style={{
//                       color: "var(--color-fg)",
//                       borderColor: "var(--color-border)",
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Wrap with AuthGuard
// export default function TeamDetailPageWithAuth() {
//   return (
//     <AuthGuard>
//       <TeamDetailPage />
//     </AuthGuard>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { DashboardNavbar } from "../../_components/DashboardNavbar";
import { AuthGuard } from "@/services/AuthGuard";
import Link from "next/link";

const TeamDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const { authUser } = useAuthStore();

  const {
    teams,
    members,
    loading,
    error,
    fetchTeams,
    fetchTeamMembers,
    fetchTeamInvites,
    sendInvite,
    updateMemberRole,
    removeMember,
    deleteTeam,
    leaveTeam,
    cancelInvite,
    clearError,
    getTeamInvites, // FIX: Use helper method to get team-specific invites
    teamMembersLoaded,
    teamInvitesLoaded,
    teamsLoaded,
  } = useTeamStore();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "Member" as "Owner" | "Manager" | "Member",
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  // FIX: Get current team from teams array
  const currentTeam = teams.find((t) => (t.id || t._id) === teamId);

  // FIX: Get team-specific invites using helper method
  const teamInvites = getTeamInvites(teamId);

  useEffect(() => {
    if (authUser) {
      // Fetch teams first if not loaded
      if (!teamsLoaded) {
        fetchTeams();
      }

      // Then fetch team-specific data
      if (!teamMembersLoaded[teamId]) {
        fetchTeamMembers(teamId);
      }
      if (!teamInvitesLoaded[teamId]) {
        fetchTeamInvites(teamId);
      }
    }
  }, [
    authUser,
    teamId,
    fetchTeams,
    fetchTeamMembers,
    fetchTeamInvites,
    teamsLoaded,
    teamMembersLoaded,
    teamInvitesLoaded,
  ]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setSendingInvite(true);
    try {
      const result = await sendInvite(
        teamId,
        inviteForm.email,
        inviteForm.role
      );
      if (result) {
        setInviteForm({ email: "", role: "Member" });
        setShowInviteForm(false);
        console.log("Invite sent successfully");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (
      !window.confirm(
        `Are you sure you want to change this member's role to ${newRole}?`
      )
    ) {
      return;
    }

    try {
      const success = await updateMemberRole(teamId, memberId, newRole);
      if (success) {
        console.log("Member role updated successfully");
      }
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from this team?`
      )
    ) {
      return;
    }

    try {
      const success = await removeMember(teamId, memberId);
      if (success) {
        console.log("Member removed successfully");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (
      !window.confirm(`Are you sure you want to cancel the invite to ${email}?`)
    ) {
      return;
    }

    try {
      const success = await cancelInvite(teamId, inviteId);
      if (success) {
        console.log("Invite cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel invite:", error);
    }
  };

  const handleDeleteTeam = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const success = await deleteTeam(teamId);
      if (success) {
        router.push("/dashboard/teams");
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) {
      return;
    }

    try {
      const success = await leaveTeam(teamId);
      if (success) {
        router.push("/dashboard/teams");
      }
    } catch (error) {
      console.error("Failed to leave team:", error);
    }
  };

  // Check if current user is owner or manager
  const isOwnerOrManager = () => {
    if (!currentTeam || !authUser) return false;

    // Check if user is team owner
    if (currentTeam.userId === authUser.id) return true;

    // Check if user is manager
    const userMember = members.find((m) => m.userId === authUser.id);
    return userMember?.role === "Manager";
  };

  const isOwner = () => {
    return currentTeam?.userId === authUser?.id;
  };

  if (loading && !currentTeam) {
    return (
      <div className="min-h-screen glass-bg">
        <DashboardNavbar currentTeam={null} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!currentTeam && teamsLoaded) {
    return (
      <div className="min-h-screen glass-bg">
        <DashboardNavbar currentTeam={null} />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
              <p className="text-text/70 mb-6">
                The team you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Link
                href="/dashboard/teams"
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
              >
                Back to Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={currentTeam} />

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Team Header */}
        <div className="glass-card p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold">{currentTeam?.name}</h1>
                {isOwner() && (
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-text/70 mb-4">{currentTeam?.description}</p>
              <div className="flex items-center space-x-6 text-sm text-text/60">
                <span>{members.length} members</span>
                <span>{teamInvites.length} pending invites</span>
                <span>
                  Created{" "}
                  {new Date(currentTeam?.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOwnerOrManager() && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="glass-btn glass-btn-primary px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Invite Members
                </button>
              )}

              {isOwner() ? (
                <button
                  onClick={handleDeleteTeam}
                  className="glass-btn glass-btn-danger px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Delete Team
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  className="glass-btn glass-btn-warning px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Leave Team
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members Section */}
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Members ({members.length})
            </h2>

            {members.length === 0 ? (
              <p className="text-text/70 text-center py-8">No members found</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 glass-card rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/40 to-primary/60 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-text/60">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === "Owner"
                            ? "bg-primary/20 text-primary"
                            : member.role === "Manager"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {member.role}
                      </span>

                      {isOwnerOrManager() &&
                        member.userId !== authUser?.id &&
                        member.role !== "Owner" && (
                          <div className="flex items-center space-x-1">
                            {member.role !== "Manager" && (
                              <button
                                onClick={() =>
                                  handleUpdateRole(member.id, "Manager")
                                }
                                className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1"
                              >
                                Promote
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleRemoveMember(member.id, member.name)
                              }
                              className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invites Section */}
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Pending Invites ({teamInvites.length})
            </h2>

            {teamInvites.length === 0 ? (
              <p className="text-text/70 text-center py-8">
                No pending invites
              </p>
            ) : (
              <div className="space-y-3">
                {teamInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 glass-card rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-text/60">
                        Role: {invite.role} • Expires:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>

                    {isOwnerOrManager() && (
                      <button
                        onClick={() =>
                          handleCancelInvite(invite.id, invite.email)
                        }
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl shadow-2xl w-full max-w-md m-4">
              <h3 className="text-xl font-semibold mb-4">Invite Team Member</h3>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    className="w-full glass-input px-4 py-3 rounded-lg"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({
                        ...inviteForm,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full glass-input px-4 py-3 rounded-lg"
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                    {isOwner() && <option value="Owner">Owner</option>}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="glass-btn glass-btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {sendingInvite ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with AuthGuard
export default function TeamDetailPageWithAuth() {
  return (
    <AuthGuard>
      <TeamDetailPage />
    </AuthGuard>
  );
}