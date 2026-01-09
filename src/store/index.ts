import { defineStore } from "pinia";
import { genTestUserSig } from "../utils/generateTestUserSig";

// Types for one-to-one talk system
interface Client {
  socketId: string;
  userId: string;
  joinedAt: number;
  isPublishing: boolean;
  hasRequestedTalk: boolean;
}

interface TalkRequest {
  socketId: string;
  userId: string;
  requestedAt: number;
}

interface ActiveCall {
  clientSocketId: string;
  clientUserId: string;
  serverUserId: string | null;
  startedAt: number;
}

interface ActiveCallInfo {
  clientSocketId: string;
  clientUserId: string;
  serverUserId: string | null;
  startedAt: number;
}

const appStore = defineStore("app", {
  state: () => ({
    // Original TRTC state
    sdkAppId: "",
    userId: "",
    strRoomId: "",
    sdkSecretKey: "",
    userSig: "",
    audioDeviceId: "",
    videoDeviceId: "",
    cameraList: [] as any[],
    microphoneList: [] as any[],
    logs: [] as { type: string; content: string }[],
    remoteUsersViews: [] as string[],
    invitedRemoteUsers: [] as string[],

    // ================================
    // ONE-TO-ONE TALK SYSTEM STATE
    // ================================

    // Role: 'server' | 'client' | null
    role: null as "server" | "client" | null,

    // Socket connection status
    socketConnected: false,

    // Server-specific state (only used when role === 'server')
    serverState: {
      clients: [] as Client[],
      talkRequests: [] as TalkRequest[],
      totalClients: 0,
    },

    // Client-specific state (only used when role === 'client')
    clientState: {
      hasPendingRequest: false,
      isInvited: false,
      invitedBy: null as string | null,
      canPublish: false,
    },

    // Shared active calls state (both server and client use this) - supports multiple
    activeCalls: [] as ActiveCallInfo[],

    // Server user ID (for clients to know who the server is)
    serverUserId: null as string | null,

    // Server publishing state
    serverIsPublishing: false,

    // Fixed room ID from backend
    fixedRoomId: "main_broadcast_room",

    // UI Size Control (admin-controlled)
    uiSize: {
      width: 500, // Default 500px
      height: 500, // Default 500px
    },

    // Device Status (for color indicators)
    // red: no device/permission, yellow: device available but not in use, green: device in use
    deviceStatus: {
      camera: 'red' as 'red' | 'yellow' | 'green',
      microphone: 'red' as 'red' | 'yellow' | 'green',
    },
  }),

  getters: {
    // Check if user is the server
    isServer: (state) => state.role === "server",

    // Check if user is a client
    isClient: (state) => state.role === "client",

    // Check if there are any active calls
    hasActiveCalls: (state) => state.activeCalls.length > 0,

    // Get count of active calls
    activeCallsCount: (state) => state.activeCalls.length,

    // Check if current client is one of the active callers
    isActiveClient: (state) => {
      if (state.role !== "client" || state.activeCalls.length === 0) return false;
      return state.activeCalls.some((call) => call.clientUserId === state.userId);
    },

    // Get list of active client user IDs
    activeClientUserIds: (state) => state.activeCalls.map((call) => call.clientUserId),

    // Get pending talk requests count (for server)
    pendingRequestsCount: (state) => state.serverState.talkRequests.length,

    // Get UI size with constraints
    constrainedWidth: (state) => {
      const minWidth = 300;
      const maxWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      return Math.max(minWidth, Math.min(state.uiSize.width, maxWidth));
    },
    constrainedHeight: (state) => {
      const minHeight = 300;
      const maxHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      return Math.max(minHeight, Math.min(state.uiSize.height, maxHeight));
    },
  },

  actions: {
    getInitParamsStates() {
      return !!(this.sdkAppId && this.sdkSecretKey && this.strRoomId && this.userId);
    },

    getUserSig() {
      return (
        this.userSig ||
        genTestUserSig({
          sdkAppId: parseInt(this.sdkAppId, 10),
          userId: this.userId,
          sdkSecretKey: this.sdkSecretKey,
        }).userSig
      );
    },

    createShareLink() {
      const userId = `Guest_${Math.floor(Math.random() * 1000000)}`;
      const { userSig } = genTestUserSig({
        sdkAppId: parseInt(this.sdkAppId, 10),
        userId,
        sdkSecretKey: this.sdkSecretKey,
      });
      const { origin } = window.location;
      const { pathname } = window.location;
      return `${origin}${pathname}#/invite?userSig=${userSig}&&SDKAppId=${this.sdkAppId}&&userId=${userId}&&strRoomId=${this.strRoomId}`;
    },

    addSuccessLog(str: string) {
      this.logs.push({
        type: "success",
        content: str,
      });
    },

    addFailedLog(str: string) {
      this.logs.push({
        type: "failed",
        content: str,
      });
    },

    // ================================
    // ONE-TO-ONE TALK SYSTEM ACTIONS
    // ================================

    // Set role (called when joining room)
    setRole(role: "server" | "client") {
      this.role = role;
    },

    // Update socket connection status
    setSocketConnected(connected: boolean) {
      this.socketConnected = connected;
    },

    // Update client list (for server)
    updateClientList(data: { clients: Client[]; talkRequests: TalkRequest[]; totalClients: number }) {
      this.serverState.clients = data.clients;
      this.serverState.talkRequests = data.talkRequests;
      this.serverState.totalClients = data.totalClients;
    },

    // Update active calls state (now supports multiple)
    updateActiveCalls(activeCalls: ActiveCallInfo[], serverUserId: string | null, serverIsPublishing: boolean) {
      this.activeCalls = activeCalls;
      this.serverUserId = serverUserId;
      this.serverIsPublishing = serverIsPublishing;

      // For clients: update canPublish based on whether they're in active calls
      if (this.role === "client") {
        this.clientState.canPublish = activeCalls.some((call) => call.clientUserId === this.userId);
      }
    },

    // Client: set pending request state
    setHasPendingRequest(hasPending: boolean) {
      this.clientState.hasPendingRequest = hasPending;
    },

    // Client: set invited state
    setInvited(isInvited: boolean, invitedBy: string | null = null) {
      this.clientState.isInvited = isInvited;
      this.clientState.invitedBy = invitedBy;
    },

    // Client: set can publish
    setCanPublish(canPublish: boolean) {
      this.clientState.canPublish = canPublish;
    },

    // Reset all one-to-one talk state
    resetTalkState() {
      this.role = null;
      this.socketConnected = false;
      this.serverState = {
        clients: [],
        talkRequests: [],
        totalClients: 0,
      };
      this.clientState = {
        hasPendingRequest: false,
        isInvited: false,
        invitedBy: null,
        canPublish: false,
      };
      this.activeCalls = [];
      this.serverUserId = null;
      this.serverIsPublishing = false;
    },

    // Reset state but keep socket connected (for password errors)
    resetRoleState() {
      this.role = null;
      // Keep socketConnected as is - don't disconnect
      this.serverState = {
        clients: [],
        talkRequests: [],
        totalClients: 0,
      };
      this.clientState = {
        hasPendingRequest: false,
        isInvited: false,
        invitedBy: null,
        canPublish: false,
      };
      this.activeCalls = [];
      this.serverUserId = null;
      this.serverIsPublishing = false;
    },

    // Update UI size (admin only)
    setUiSize(width: number, height: number) {
      const minWidth = 300;
      const minHeight = 300;
      const maxWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const maxHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

      this.uiSize.width = Math.max(minWidth, Math.min(width, maxWidth));
      this.uiSize.height = Math.max(minHeight, Math.min(height, maxHeight));
    },

    // Update device status
    setCameraStatus(status: 'red' | 'yellow' | 'green') {
      this.deviceStatus.camera = status;
    },

    setMicrophoneStatus(status: 'red' | 'yellow' | 'green') {
      this.deviceStatus.microphone = status;
    },
  },
});

export default appStore;
