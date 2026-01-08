// src/locales/en.ts
export default {
  // Header
  appName: "Tencent RTC",

  // Room List
  roomList: "Room List",
  noActiveRooms: "No active rooms",
  createNewRoom: "Create New Room",
  room: "Room",
  participants: "participants",
  participant: "participant",

  // Buttons
  newRoom: "New Room",
  joinRoom: "Join Room",
  schedule: "Schedule",
  leave: "Leave",
  create: "Create",
  join: "Join",
  cancel: "Cancel",
  confirm: "Confirm",

  // Modal Titles
  createRoomTitle: "Create New Room",
  joinRoomTitle: "Join Existing Room",

  // Form Labels
  yourUserId: "Your User ID",
  roomId: "Room ID",
  enterUserId: "Enter your user ID",
  enterRoomId: "Enter room ID",
  enterRoomIdJoin: "Enter room ID to join",
  roomIdPlaceholder: "Enter room ID (e.g., 1001)",

  // Video Labels
  you: "You",
  remote: "Remote",
  yourCamera: "Your Camera",
  noRoomAvailable: "No room available for broadcasting",
  waitingForOthers: "Waiting for others...",

  // Device Controls
  mic: "Mic",
  camera: "Camera",

  // Status Messages
  creatingRoom: "Creating room...",
  joiningRoom: "Joining room...",
  roomCreated: "Room {roomId} created!",
  joinedRoom: "Joined room!",
  leftRoom: "Left the room",
  userJoined: "{userId} joined",
  userLeft: "{userId} left",
  videoConnected: "{userId} video connected!",
  micMuted: "Microphone muted",
  micUnmuted: "Microphone unmuted",
  cameraOff: "Camera off",
  cameraOn: "Camera on",
  waitingForAdmin: "Waiting for admin to join...",
  adminJoined: "Admin has joined the room!",

  // Errors
  enterBothIds: "Please enter both User ID and Room ID",
  backendError: "Backend Error",
  failedToCreate: "Failed to create room: {message}",
  failedToJoin: "Failed to join room: {message}",
  failedToLoad: "Failed to load room list",
  connectionFailed: "Backend connection failed. Make sure backend is running on port 3000.",

  // Features
  scheduleComingSoon: "Schedule feature coming soon!",

  // Language
  language: "Language",
  english: "English",
  chinese: "中文",

  // ================================
  // ONE-TO-ONE TALK SYSTEM
  // ================================

  // Connection
  connected: "Connected",
  disconnected: "Disconnected",

  // Role Selection
  oneToOneTalk: "One-to-One Talk System",
  serverRole: "Server (Dashboard)",
  clientRole: "Client (Audience)",
  serverDescription: "Control the broadcast, invite clients to talk",
  clientDescription: "Watch the broadcast, request to talk",
  joinAs: "Join as",
  server: "Server",
  client: "Client",
  joinedSuccessfully: "Joined successfully!",
  joinFailed: "Join failed",

  // Server Dashboard
  serverDashboard: "Server Dashboard",
  clients: "Clients",
  requests: "Requests",
  noActiveCall: "No Active Call",
  selectClientToStart: "Select a client to start talking",
  talking: "Talking",

  // Talk Requests
  talkRequests: "Talk Requests",
  invite: "Invite",
  connectedClients: "Connected Clients",
  requested: "Requested",
  audience: "Audience",
  noClientsYet: "No clients connected yet",

  // Call Actions
  endCall: "End Call",
  endCurrentCallFirst: "End current call first",
  invitationSent: "Invitation sent",
  callStarted: "Call started",
  callEnded: "Call ended",

  // Client View
  clientView: "Client View",
  waitingForServer: "Waiting for server...",
  serverVideo: "Server Video",
  waitingForServerVideo: "Waiting for server to start broadcasting",

  // Talk Request
  requestTalk: "Request Talk",
  cancelRequest: "Cancel Request",
  requestSubmitted: "Talk request submitted",
  requestCancelled: "Talk request cancelled",
  isTalking: "is talking with server",

  // Invitation
  invitationReceived: "Invitation Received!",
  serverInviting: "The server is inviting you to talk",
  accept: "Accept",
  decline: "Decline",
  declinedInvitation: "declined the invitation",

  // Publishing
  publishFailed: "Failed to start publishing",

  // Disconnection
  serverDisconnected: "Server has disconnected",
  disconnectedDuringCall: "disconnected during call",
  leaveFailed: "Failed to leave room",

  // General
  joined: "joined",
  left: "left",

  // Password
  adminPassword: "Admin Password",
  enterAdminPassword: "Enter admin password",
  invalidPassword: "Invalid admin password",

  // Talk Request Actions
  reject: "Reject",
  requestRejected: "Request rejected",
  yourRequestRejected: "Your talk request was rejected",

  // Multiple Clients Support
  activeCalls: "Active",
  endAllCalls: "End All Calls",
  joinedCall: "joined the call",
  areTalking: "are talking with server",
  clientAlreadyInCall: "This client is already in a call",
  joinedCallMuted: "Joined call - camera & mic are off. Turn them on to speak.",

  // Server Errors
  serverAlreadyExists: "A server is already connected. Only one server is allowed at a time.",

  // Additional translations needed
  showClients: "👥 Clients",
  hideClients: "👥 Clients",
  noRequests: "No requests",
  joinToStart: "Join to Start",
  clickJoinRoomToEnter: "Click 'Join Room' to enter",
  joinToSeeRequests: "Join to see requests",
  enterYourId: "Enter Your ID",
  invited: "Invited",

  // User ID validation
  userIdAlreadyExists: "This user ID already exists. Please enter a unique ID.",
  enterPassword: "Enter Password",
  invalidCredentials: "Invalid user ID or password. Please check your credentials.",
};
