<template>
  <div class="trtc-container">
    <!-- Language Switcher -->
    <div class="language-switcher">
      <button class="lang-btn" :class="{ active: currentLocale === 'en' }" @click="changeLanguage('en')">EN</button>
      <button class="lang-btn" :class="{ active: currentLocale === 'zh' }" @click="changeLanguage('zh')">中文</button>
    </div>

    <!-- Connection Status -->
    <div class="connection-status" :class="{ connected: store.socketConnected }">
      {{ store.socketConnected ? "🟢" : "🔴" }} {{ store.socketConnected ? t("connected") : t("disconnected") }}
    </div>

    <!-- Join Room Preview Interface (shows same UI structure) -->
    <div v-if="!isInRoom" class="join-preview">
      <!-- Preview Header -->
      <div class="dashboard-header">
        <h2>{{ t("appName") }}</h2>
        <div class="stats">
          <span class="stat">👥 0 {{ t("clients") }}</span>
        </div>
      </div>

      <!-- Preview Video Section -->
      <div class="server-video-section">
        <div class="main-video-area">
          <div class="video-placeholder">
            <div class="placeholder-icon">📺</div>
            <p>{{ t("joinToStart") }}</p>
            <p class="small-text">{{ t("clickJoinRoomToEnter") }}</p>
          </div>
        </div>
        <!-- Preview PIP Video -->
        <div class="pip-video preview-pip">
          <div class="video-content preview-content"></div>
          <div class="video-label">{{ t("you") }}</div>
        </div>
      </div>

      <!-- Preview Controls Section -->
      <div class="server-controls-container">
        <div class="controls-section buttons-section">
          <div class="server-controls">
            <button class="control-btn preview-btn" disabled>🎤 {{ t("mic") }}</button>
            <button class="control-btn preview-btn" disabled>📷 {{ t("camera") }}</button>
            <button class="control-btn preview-btn" disabled>🚪 {{ t("leave") }}</button>
          </div>
        </div>
        <div class="controls-section requests-section">
          <h3 class="requests-title">🙋 {{ t("talkRequests") }}</h3>
          <div class="requests-empty">
            <p>{{ t("joinToSeeRequests") }}</p>
          </div>
        </div>
      </div>

      <!-- Join Room Overlay -->
      <div class="join-overlay">
        <div class="join-overlay-content">
          <!-- Join Room Button (initial state) -->
          <div v-if="!showJoinForm" class="join-initial">
            <button class="join-room-main-btn" @click="showJoinForm = true">
              {{ t("joinRoom") }}
            </button>
          </div>

          <!-- Join Form (after clicking join room button) -->
          <div v-else class="join-form-overlay">
            <div class="join-form-content">
              <h3>{{ t("enterYourId") }}</h3>
              <div class="input-group">
                <label :for="'userId-input'">{{ t("enterUserId") }}</label>
                <input
                  id="userId-input"
                  v-model="userId"
                  :placeholder="t('enterUserId')"
                  @keyup.enter="joinRoom"
                  autofocus
                />
              </div>
              <div class="input-group">
                <label :for="'password-input'">{{ t("enterPassword") }}</label>
                <input
                  id="password-input"
                  v-model="password"
                  type="password"
                  :placeholder="t('enterPassword')"
                  @keyup.enter="joinRoom"
                />
              </div>
              <div class="join-actions">
                <button class="join-btn" @click="joinRoom" :disabled="!userId || !password">
                  {{ t("join") }}
                </button>
                <button
                  class="cancel-btn"
                  @click="
                    showJoinForm = false;
                    password = '';
                  "
                >
                  {{ t("cancel") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show Clients Toggle Button (only for server) -->
    <button
      v-if="isInRoom && store.isServer"
      class="sidebar-toggle-top"
      @click="toggleSidebar"
      :class="{ open: sidebarOpen }"
      :title="sidebarOpen ? t('hideClients') : t('showClients')"
    >
      <span class="toggle-text">
        {{ sidebarOpen ? t("hideClients") : t("showClients") }}
      </span>
    </button>

    <!-- Loading state while joining -->
    <div v-if="joining" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ t("joiningRoom") }}...</p>
    </div>

    <!-- ============================================ -->
    <!-- SERVER DASHBOARD VIEW -->
    <!-- ============================================ -->
    <div v-if="isInRoom && store.isServer" class="server-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="stats">
          <span
            class="stat clients-stat"
            @click="toggleSidebar"
            :title="sidebarOpen ? t('👥 Clients') : t('👥 Clients')"
          >
            👥 {{ store.serverState.totalClients }} {{ t("clients") }}
          </span>
          <span class="stat active-count" v-if="store.activeCalls.length > 0">
            📞 {{ store.activeCalls.length }} {{ t("activeCalls") }}
          </span>
          <span class="stat request-count" v-if="store.pendingRequestsCount > 0">
            🙋 {{ store.pendingRequestsCount }} {{ t("requests") }}
          </span>
        </div>
      </div>

      <!-- Video Section -->
      <div class="server-video-section">
        <!-- Main Video Area: Shows placeholder or active clients grid -->
        <div class="main-video-area">
          <div v-if="store.activeCalls.length === 0" class="video-placeholder">
            <div class="placeholder-icon">📺</div>
            <p>{{ t("noActiveCall") }}</p>
            <p class="small-text">{{ t("selectClientToStart") }}</p>
          </div>

          <!-- Active Clients Video Grid -->
          <div
            v-else
            class="active-clients-grid"
            :class="{ single: store.activeCalls.length === 1, multiple: store.activeCalls.length > 1 }"
          >
            <div v-for="call in store.activeCalls" :key="call.clientSocketId" class="active-client-video">
              <div class="video-content" :ref="(el) => setActiveClientVideoRef(call.clientSocketId, el)"></div>
              <div class="video-label">
                {{ call.clientUserId }}
                <!-- <button class="end-client-call-btn" @click="endCallWithClient(call.clientSocketId)">✕</button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- PIP: Server Self Video -->
        <div class="pip-video">
          <div ref="serverLocalVideoRef" class="video-content"></div>
          <div class="video-label">{{ t("you") }}</div>
        </div>
      </div>

      <!-- Client Management Sidebar -->
      <div class="client-sidebar" :class="{ open: sidebarOpen }">
        <div class="sidebar-content">
          <h3 class="sidebar-title">👥 {{ t("connectedClients") }}</h3>
          <div class="client-list" v-if="store.serverState.clients.length > 0">
            <div
              v-for="client in store.serverState.clients"
              :key="client.socketId"
              class="client-item"
              :class="{
                active: isClientInActiveCall(client.socketId),
                invited: isClientInvited(client.socketId),
              }"
            >
              <span class="user-name">{{ client.userId }}</span>

              <!-- Show "Invited" status -->
              <div
                v-if="isClientInvited(client.socketId) && !isClientInActiveCall(client.socketId)"
                class="invited-status"
              >
                {{ t("invited") }}
              </div>

              <!-- Show "Invite" button if not invited and not in call -->
              <button
                v-else-if="!isClientInActiveCall(client.socketId) && !isClientInvited(client.socketId)"
                class="client-action-btn invite-btn"
                @click="inviteClient(client.socketId)"
              >
                {{ t("invite") }}
              </button>

              <!-- Show "End Call" button if in active call -->
              <button
                v-else-if="isClientInActiveCall(client.socketId)"
                class="client-action-btn end-btn"
                @click="endCallWithClient(client.socketId)"
              >
                {{ t("endCall") }}
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>{{ t("noClientsYet") }}</p>
          </div>
        </div>
      </div>

      <!-- Server Controls - Split into two sections -->
      <div class="server-controls-container">
        <!-- Left Half: Control Buttons -->
        <div class="controls-section buttons-section">
          <div class="server-controls">
            <button class="control-btn mic" :class="{ muted: isMicMuted }" @click="toggleMic">
              {{ isMicMuted ? "🔇" : "🎤" }} {{ t("mic") }}
            </button>
            <button class="control-btn camera" :class="{ muted: isCameraMuted }" @click="toggleCamera">
              {{ isCameraMuted ? "📷" : "📷" }} {{ t("camera") }}
            </button>
            <button class="control-btn leave" @click="leaveRoom">🚪 {{ t("leave") }}</button>
            <button v-if="store.activeCalls.length > 0" class="control-btn end-call" @click="endAllCalls">
              ❌ {{ t("endAllCalls") }} ({{ store.activeCalls.length }})
            </button>
          </div>
        </div>

        <!-- Right Half: Requested Clients -->
        <div class="controls-section requests-section">
          <h3 class="requests-title">🙋 {{ t("talkRequests") }}</h3>
          <div class="requests-list" v-if="store.serverState.talkRequests.length > 0">
            <div v-for="request in store.serverState.talkRequests" :key="request.socketId" class="request-item">
              <span class="request-user-name">{{ request.userId }}</span>
              <div class="request-actions">
                <button class="request-btn reject-btn" @click="rejectTalkRequest(request.socketId)">
                  {{ t("reject") }}
                </button>
                <button class="request-btn accept-btn" @click="inviteClient(request.socketId)">
                  {{ t("accept") }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="requests-empty">
            <p>{{ t("noRequests") }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CLIENT VIEW -->
    <!-- ============================================ -->
    <div v-if="isInRoom && store.isClient" class="client-view">
      <!-- Header -->
      <div class="client-header">
        <div class="status-info">
          <span v-if="store.serverUserId" class="server-status"> 🖥️ {{ t("server") }}: {{ store.serverUserId }} </span>
          <span v-else class="server-status waiting"> ⏳ {{ t("waitingForServer") }} </span>
        </div>
      </div>

      <!-- Video Section -->
      <div class="client-video-section">
        <!-- Main Video: Server -->
        <div class="main-video">
          <div ref="serverRemoteVideoRef" class="video-content">
            <!-- <div v-if="!store.serverIsPublishing" class="video-placeholder">
              <div class="placeholder-icon">🖥️</div>
              <p>{{ t("serverVideo") }}</p>
              <p class="small-text">{{ t("waitingForServerVideo") }}</p>
            </div> -->
          </div>
          <div class="video-label" v-if="store.serverUserId">{{ store.serverUserId }} ({{ t("server") }})</div>
        </div>

        <!-- PIP: Own Video (always show when active) -->
        <div class="pip-video client-self" v-if="store.isActiveClient">
          <div ref="clientLocalVideoRef" class="video-content"></div>
          <div class="video-label">{{ t("you") }}</div>
        </div>

        <!-- Show other active clients' videos (not self) -->
        <div
          v-for="(call, index) in otherActiveClients"
          :key="call.clientSocketId"
          class="pip-video active-client"
          :style="{ right: 8 + (otherActiveClients.length - index) * 0 + 'px' }"
        >
          <div :ref="(el) => setOtherClientVideoRef(call.clientSocketId, el)" class="video-content"></div>
          <div class="video-label">{{ call.clientUserId }}</div>
        </div>
      </div>

      <!-- Invitation Modal -->
      <div v-if="store.clientState.isInvited" class="invitation-modal">
        <div class="modal-content">
          <div class="invitation-icon">📞</div>
          <h3>{{ t("invitationReceived") }}</h3>
          <p>{{ t("serverInviting") }}</p>
          <div class="invitation-actions">
            <button class="btn-decline" @click="declineInvitation">{{ t("decline") }}</button>
            <button class="btn-accept" @click="acceptInvitation">{{ t("accept") }}</button>
          </div>
        </div>
      </div>

      <!-- Client Controls -->
      <div class="client-controls">
        <!-- Request Talk Button (only when not in call and not invited) -->
        <button
          v-if="!store.isActiveClient && !store.clientState.isInvited"
          class="control-btn request-talk"
          :class="{ pending: store.clientState.hasPendingRequest }"
          @click="toggleTalkRequest"
          :disabled="!store.serverUserId"
        >
          {{ store.clientState.hasPendingRequest ? "❌ " + t("cancelRequest") : "🙋 " + t("requestTalk") }}
        </button>

        <!-- Active Call Controls -->
        <template v-if="store.isActiveClient">
          <button class="control-btn mic" :class="{ muted: isMicMuted }" @click="toggleMic">
            {{ isMicMuted ? "🔇" : "🎤" }} {{ t("mic") }}
          </button>
          <button class="control-btn camera" :class="{ muted: isCameraMuted }" @click="toggleCamera">
            {{ isCameraMuted ? "📷" : "📹" }} {{ t("camera") }}
          </button>
        </template>

        <!-- Call Status: Show other active callers -->
        <div v-if="otherActiveClients.length > 0 && !store.isActiveClient" class="call-status">
          <span>📞 {{ otherActiveClients.map((c) => c.clientUserId).join(", ") }} {{ t("areTalking") }}</span>
        </div>

        <button class="control-btn leave" @click="leaveRoom">🚪 {{ t("leave") }}</button>
      </div>
    </div>

    <!-- Status Toast -->
    <div v-if="statusMessage" class="toast" :class="statusType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { io, Socket } from "socket.io-client";
import TRTC from "trtc-sdk-v5";
import appStore from "@/store/index";
import { getApiUrl } from "@/utils/utils";

// i18n
const { t, locale } = useI18n();
const currentLocale = ref(locale.value);

// Store
const store = appStore();

// Change language
const changeLanguage = (lang: string) => {
  locale.value = lang;
  currentLocale.value = lang;
  localStorage.setItem("trtc-language", lang);
};

// Video refs
const serverLocalVideoRef = ref<HTMLDivElement>();
const serverRemoteVideoRef = ref<HTMLDivElement>();
const clientLocalVideoRef = ref<HTMLDivElement>();

// Dynamic video refs for multiple active clients
const activeClientVideoRefs = ref<Map<string, HTMLDivElement>>(new Map());
const otherClientVideoRefs = ref<Map<string, HTMLDivElement>>(new Map());

// Set video ref for active client (server view)
const setActiveClientVideoRef = (socketId: string, el: any) => {
  if (el) {
    activeClientVideoRefs.value.set(socketId, el);
  }
};

// Set video ref for other active clients (client view)
const setOtherClientVideoRef = (socketId: string, el: any) => {
  if (el) {
    otherClientVideoRefs.value.set(socketId, el);
  }
};

// Computed: other active clients (not self)
const otherActiveClients = computed(() => {
  return store.activeCalls.filter((call) => call.clientUserId !== store.userId);
});

// Helper: check if a client is in active call
const isClientInActiveCall = (socketId: string) => {
  return store.activeCalls.some((call) => call.clientSocketId === socketId);
};

// Track invited clients (socketId -> boolean)
const invitedClients = ref<Set<string>>(new Set());

// Check if client is invited
const isClientInvited = (socketId: string) => {
  return invitedClients.value.has(socketId);
};

// Sidebar toggle state
const sidebarOpen = ref(false); // Start closed

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// State
const isInRoom = ref(false);
const joining = ref(false); // Track joining state
const isMicMuted = ref(false);
const isCameraMuted = ref(false);
const statusMessage = ref("");
const statusType = ref("info");
const userId = ref(""); // Will be set with default when join form shows
const password = ref(""); // Password for authentication
const showJoinForm = ref(false); // Control join form visibility

// Socket and TRTC
let socket: Socket | null = null;
let trtc: any = null;
let sdkAppId = 0;
let userSig = "";
let fixedRoomId = "";

// Track remote users for TRTC
const remoteUsers = ref<Map<string, { videoAvailable: boolean; audioAvailable: boolean }>>(new Map());

// ============================================
// SOCKET.IO CONNECTION
// ============================================

const initSocket = () => {
  socket = io(getApiUrl(), {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
    store.setSocketConnected(true);
    // Don't auto-join anymore - wait for user to click join
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
    store.setSocketConnected(false);
  });

  // Join room success - now includes role from backend
  socket.on("join_room_success", async (data: any) => {
    console.log("✅ Joined room:", data);
    store.serverUserId = data.serverUserId || null;

    // Set role from backend response
    store.setRole(data.role);

    isInRoom.value = true;
    joining.value = false; // Turn off loading when successfully joined
    showStatus(t("joinedSuccessfully"), "success");

    // If server, start publishing
    if (data.role === "server") {
      await startServerPublishing();
    }
  });

  // Client list update (for server)
  socket.on("client_list_update", (data: any) => {
    console.log("📋 Client list updated:", data);
    store.updateClientList(data);
  });

  // Active calls update (for everyone) - now supports multiple
  socket.on("active_calls_update", (data: any) => {
    console.log("📞 Active calls update:", data);
    store.updateActiveCalls(data.activeCalls || [], data.serverUserId, data.serverIsPublishing);

    // Handle remote video subscription based on active calls
    handleActiveCallsVideoUpdate(data);
  });

  // Client joined call notification (for server) - client accepted invitation
  socket.on("client_joined_call", (data: any) => {
    console.log("📞 Client joined call:", data.clientUserId);
    // Remove from invited list since they accepted
    invitedClients.value.delete(data.clientSocketId);
    showStatus(`${data.clientUserId} ${t("joinedCall")}`, "success");
  });

  // Invitation received (for client)
  socket.on("invite_to_talk", (data: any) => {
    console.log("📨 Invitation received:", data);
    store.setInvited(true, data.serverUserId);
    showStatus(t("invitationReceived"), "info");
  });

  // Start call (for both server and client)
  socket.on("start_call", async (data: any) => {
    console.log("📞 Call started:", data);
    store.setInvited(false);
    store.setCanPublish(true);

    // Client should start publishing
    if (store.isClient) {
      await startClientPublishing();
    }

    showStatus(t("callStarted"), "success");
  });

  // End call
  socket.on("end_call", async (data: any) => {
    console.log("📴 Call ended:", data);
    store.setCanPublish(false);
    store.setInvited(false);
    store.setHasPendingRequest(false); // Reset pending request state when call ends

    // Stop publishing if client
    if (store.isClient) {
      await stopClientPublishing();
    }

    showStatus(t("callEnded"), "info");
  });

  // End call success (for server)
  socket.on("end_call_success", (data: any) => {
    console.log("📴 Call ended successfully:", data);
    showStatus(t("callEnded"), "success");
  });

  // Invitation declined (for server) - client rejected invitation
  socket.on("invite_declined", (data: any) => {
    console.log("🚫 Invitation declined by:", data.clientUserId);
    // Remove from invited list since they declined
    invitedClients.value.delete(data.clientSocketId);
    showStatus(`${data.clientUserId} ${t("declinedInvitation")}`, "info");
  });

  // Request talk success
  socket.on("request_talk_success", () => {
    store.setHasPendingRequest(true);
    showStatus(t("requestSubmitted"), "success");
  });

  // Cancel request success
  socket.on("cancel_talk_request_success", () => {
    store.setHasPendingRequest(false);
    showStatus(t("requestCancelled"), "info");
  });

  // Talk request rejected by server (for client)
  socket.on("talk_request_rejected", () => {
    store.setHasPendingRequest(false);
    showStatus(t("yourRequestRejected"), "error");
  });

  // Server disconnected
  socket.on("server_disconnected", (data: any) => {
    console.log("🖥️ Server disconnected");
    store.serverUserId = null;
    showStatus(t("serverDisconnected"), "error");
  });

  // Client disconnected during call (for server)
  socket.on("client_call_disconnected", (data: any) => {
    console.log("👤 Client disconnected during call:", data.clientUserId);
    showStatus(`${data.clientUserId} ${t("disconnectedDuringCall")}`, "info");
  });

  // Error handling
  socket.on("error", async (data: any) => {
    console.error("❌ Socket error:", data.message);

    // Handle authentication errors (invalid credentials, wrong password, invalid user ID)
    if (
      data.message.includes("password") ||
      data.message.includes("credentials") ||
      data.message.includes("Invalid user ID") ||
      data.message === "password is required" ||
      data.message === "userId is required"
    ) {
      joining.value = false; // Stop loading
      password.value = ""; // Clear password
      showStatus(t("invalidCredentials"), "error");
      return;
    }

    // Stop loading for any error during join process
    if (joining.value) {
      joining.value = false;
    }

    // Check if it's a password error - redirect to main page but keep socket connected
    if (data.message === "Invalid admin password") {
      showStatus(t("invalidPassword"), "error");

      // Leave TRTC room if already entered
      if (trtc) {
        try {
          await trtc.exitRoom();
          trtc.destroy();
          trtc = null;
        } catch (err) {
          console.error("Error leaving TRTC room:", err);
        }
      }

      // Reset state to go back to role selection but keep socket connected
      isInRoom.value = false;
      userId.value = ""; // Clear auto-generated userId
      store.resetRoleState();
    }
    // Check if server already exists - redirect to main page
    else if (data.message === "A server is already connected") {
      showStatus(t("serverAlreadyExists"), "error");

      // Leave TRTC room if already entered
      if (trtc) {
        try {
          await trtc.exitRoom();
          trtc.destroy();
          trtc = null;
        } catch (err) {
          console.error("Error leaving TRTC room:", err);
        }
      }

      // Reset state to go back to role selection but keep socket connected
      isInRoom.value = false;
      userId.value = ""; // Clear auto-generated userId
      store.resetRoleState();
    }
    // Check if it's a duplicate user ID error
    else if (data.message === "This user ID already exists. Please enter a unique ID.") {
      showStatus(t("userIdAlreadyExists"), "error");

      // Leave TRTC room if already entered
      if (trtc) {
        try {
          await trtc.exitRoom();
          trtc.destroy();
          trtc = null;
        } catch (err) {
          console.error("Error leaving TRTC room:", err);
        }
      }

      // Reset state to go back to join form but keep socket connected
      isInRoom.value = false;
      joining.value = false;
      showJoinForm.value = true; // Show join form again so user can enter new ID
      store.resetRoleState();
      return;
    } else {
      showStatus(data.message, "error");
    }
  });
};

// ============================================
// TRTC INITIALIZATION
// ============================================

const initTRTC = () => {
  trtc = TRTC.create();

  trtc.on(TRTC.EVENT.REMOTE_USER_ENTER, handleRemoteUserEnter);
  trtc.on(TRTC.EVENT.REMOTE_USER_EXIT, handleRemoteUserExit);
  trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, handleRemoteVideoAvailable);
  trtc.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, handleRemoteVideoUnavailable);
  trtc.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, handleRemoteAudioAvailable);
  trtc.on(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, handleRemoteAudioUnavailable);
  trtc.on(TRTC.EVENT.ERROR, handleTRTCError);
};

const handleRemoteUserEnter = (event: any) => {
  console.log("👤 Remote user entered:", event.userId);
  remoteUsers.value.set(event.userId, { videoAvailable: false, audioAvailable: false });
  showStatus(`${event.userId} ${t("joined")}`, "info");
};

const handleRemoteUserExit = (event: any) => {
  console.log("👤 Remote user exited:", event.userId);
  remoteUsers.value.delete(event.userId);
  showStatus(`${event.userId} ${t("left")}`, "info");
};

const handleRemoteVideoAvailable = async (event: any) => {
  console.log("📹 Remote video available:", event.userId, event.streamType);

  const user = remoteUsers.value.get(event.userId);
  if (user) user.videoAvailable = true;

  // Try to subscribe to video with retry (video element might not be ready yet)
  await subscribeToRemoteVideo(event.userId, event.streamType);
};

// Subscribe to remote video with retry mechanism
const subscribeToRemoteVideo = async (visitorUserId: string, streamType: any, retryCount = 0) => {
  await nextTick();

  // Determine which video element to use
  let targetView: HTMLDivElement | undefined;

  if (store.isServer) {
    // Server: check if this user is in active calls
    const activeCall = store.activeCalls.find((call) => call.clientUserId === visitorUserId);
    if (activeCall) {
      targetView = activeClientVideoRefs.value.get(activeCall.clientSocketId);
      console.log("🎯 Server looking for video ref:", activeCall.clientSocketId, "Found:", !!targetView);
    }
  } else if (store.isClient) {
    // Client: server video goes to main
    if (visitorUserId === store.serverUserId) {
      targetView = serverRemoteVideoRef.value;
    } else {
      // Check if this is another active client (not self)
      const activeCall = store.activeCalls.find(
        (call) => call.clientUserId === visitorUserId && visitorUserId !== store.userId
      );
      if (activeCall) {
        targetView = otherClientVideoRefs.value.get(activeCall.clientSocketId);
      }
    }
  }

  if (targetView) {
    try {
      await trtc.startRemoteVideo({
        userId: visitorUserId,
        streamType: streamType,
        view: targetView,
      });
      console.log("✅ Started remote video for:", visitorUserId);
    } catch (err: any) {
      console.error("❌ Failed to start remote video:", err);
    }
  } else if (retryCount < 5) {
    // Retry after a short delay if video element not ready yet
    console.log(`⏳ Video ref not ready for ${visitorUserId}, retrying... (${retryCount + 1}/5)`);
    setTimeout(() => {
      subscribeToRemoteVideo(visitorUserId, streamType, retryCount + 1);
    }, 500);
  } else {
    console.warn(`⚠️ Could not find video element for ${visitorUserId} after 5 retries`);
  }
};

const handleRemoteVideoUnavailable = (event: any) => {
  console.log("📹 Remote video unavailable:", event.userId);
  const user = remoteUsers.value.get(event.userId);
  if (user) user.videoAvailable = false;

  trtc.stopRemoteVideo({ userId: event.userId, streamType: event.streamType });
};

const handleRemoteAudioAvailable = (event: any) => {
  console.log("🔊 Remote audio available:", event.userId);
  const user = remoteUsers.value.get(event.userId);
  if (user) user.audioAvailable = true;
};

const handleRemoteAudioUnavailable = (event: any) => {
  console.log("🔇 Remote audio unavailable:", event.userId);
  const user = remoteUsers.value.get(event.userId);
  if (user) user.audioAvailable = false;
};

const handleTRTCError = (error: any) => {
  console.error("❌ TRTC Error:", error);
  showStatus(`TRTC Error: ${error.message}`, "error");
};

// Handle video subscription when active calls change (supports multiple)
const handleActiveCallsVideoUpdate = async (data: any) => {
  // Wait for Vue to render the new video elements
  await nextTick();

  // Additional delay to ensure DOM is fully updated
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!trtc) return;

  // Re-subscribe to relevant remote videos based on the new active calls state
  for (const [visitorUserId, user] of remoteUsers.value.entries()) {
    if (user.videoAvailable) {
      // Use the retry-enabled subscription function
      await subscribeToRemoteVideo(visitorUserId, TRTC.TYPE.STREAM_TYPE_MAIN);
    }
  }
};

// ============================================
// USER ACTIONS
// ============================================

const getUserSig = async (userId: string) => {
  try {
    const response = await fetch(`${getApiUrl()}/getUserSig`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Backend connection failed");
    const data = await response.json();
    sdkAppId = data.sdkAppId;
    userSig = data.userSig;
    fixedRoomId = data.roomId;
    store.fixedRoomId = fixedRoomId;
    store.sdkAppId = String(sdkAppId);
    store.userId = userId;
    store.userSig = userSig;
  } catch (error: any) {
    showStatus(`${t("backendError")}: ${error.message}`, "error");
    throw error;
  }
};

// ============================================
// JOIN ROOM FUNCTION
// ============================================

const joinRoom = async () => {
  if (!userId.value) {
    showStatus(t("enterUserId"), "error");
    return;
  }

  if (!password.value) {
    showStatus(t("enterPassword"), "error");
    return;
  }

  joining.value = true; // Show loading

  try {
    showStatus(t("joiningRoom"), "info");

    // Initialize socket if not connected
    if (!socket || !socket.connected) {
      initSocket();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Get UserSig from backend
    await getUserSig(userId.value);

    // Initialize TRTC
    initTRTC();

    // Enter TRTC room
    const numericRoomId = Math.abs(hashCode(fixedRoomId));

    await trtc.enterRoom({
      roomId: numericRoomId,
      sdkAppId,
      userId: userId.value,
      userSig,
      scene: "rtc",
    });

    // Join socket room
    socket?.emit("join_room", {
      userId: userId.value,
      password: password.value,
    });
  } catch (error: any) {
    joining.value = false;
    password.value = ""; // Clear password on error
    showStatus(`${t("joinFailed")}: ${error.message}`, "error");
    store.resetTalkState();
  }
};

// Watch for when join form is shown to set default userId
watch(showJoinForm, (show) => {
  if (show && !userId.value) {
    userId.value = "user_" + Math.floor(Math.random() * 100000);
  }
});

// Simple hash function for string to number
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

// ============================================
// SERVER ACTIONS
// ============================================

const startServerPublishing = async () => {
  await nextTick();

  try {
    // Server joins with camera and mic OFF by default
    isMicMuted.value = true;
    isCameraMuted.value = true;

    // Don't start video or audio automatically
    // User can manually turn them on using the controls

    // Notify backend that server is ready (but not publishing yet)
    socket?.emit("server_publishing", { isPublishing: false });

    console.log("✅ Server joined (camera & mic off by default)");
  } catch (err: any) {
    console.error("❌ Failed to initialize server:", err);
    showStatus(`${t("publishFailed")}: ${err.message}`, "error");
  }
};

const inviteClient = (clientSocketId: string) => {
  // Check if this client is already in an active call
  if (isClientInActiveCall(clientSocketId)) {
    showStatus(t("clientAlreadyInCall"), "error");
    return;
  }

  // Add to invited list
  invitedClients.value.add(clientSocketId);

  socket?.emit("invite_to_talk", { clientSocketId });
  showStatus(t("invitationSent"), "info");
};

const rejectTalkRequest = (clientSocketId: string) => {
  socket?.emit("reject_talk_request", { clientSocketId });
  showStatus(t("requestRejected"), "info");
};

// End call with specific client
const endCallWithClient = (clientSocketId: string) => {
  socket?.emit("end_call", { clientSocketId });
};

// End all active calls
const endAllCalls = () => {
  socket?.emit("end_call", {});
};

// ============================================
// CLIENT ACTIONS
// ============================================

const toggleTalkRequest = () => {
  if (store.clientState.hasPendingRequest) {
    socket?.emit("cancel_talk_request");
  } else {
    socket?.emit("request_talk");
  }
};

const acceptInvitation = () => {
  socket?.emit("invite_accept");
};

const declineInvitation = () => {
  socket?.emit("invite_decline");
  store.setInvited(false);
};

const startClientPublishing = async () => {
  await nextTick();

  try {
    // Client joins with camera and mic OFF by default
    isMicMuted.value = true;
    isCameraMuted.value = true;

    // Don't start video or audio automatically
    // User can manually turn them on using the controls

    console.log("✅ Client joined call (camera & mic off by default)");
    showStatus(t("joinedCallMuted"), "info");
  } catch (err: any) {
    console.error("❌ Failed to start client publishing:", err);
    showStatus(`${t("publishFailed")}: ${err.message}`, "error");
  }
};

const stopClientPublishing = async () => {
  try {
    await trtc.stopLocalVideo();
    await trtc.stopLocalAudio();
    console.log("✅ Client stopped publishing");
  } catch (err: any) {
    console.error("❌ Failed to stop client publishing:", err);
  }
};

// ============================================
// COMMON ACTIONS
// ============================================

const toggleMic = async () => {
  if (!trtc) return;
  isMicMuted.value = !isMicMuted.value;

  if (isMicMuted.value) {
    await trtc.stopLocalAudio();
  } else {
    await trtc.startLocalAudio();
  }

  showStatus(isMicMuted.value ? t("micMuted") : t("micUnmuted"), "info");
};

const toggleCamera = async () => {
  if (!trtc) return;
  isCameraMuted.value = !isCameraMuted.value;

  const videoRef = store.isServer ? serverLocalVideoRef.value : clientLocalVideoRef.value;

  if (isCameraMuted.value) {
    await trtc.stopLocalVideo();
  } else if (videoRef) {
    await trtc.startLocalVideo({ view: videoRef, option: { profile: "480p" } });
  }

  showStatus(isCameraMuted.value ? t("cameraOff") : t("cameraOn"), "info");
};

const leaveRoom = async () => {
  try {
    if (trtc) {
      await trtc.exitRoom();
      trtc.destroy();
      trtc = null;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    isInRoom.value = false;
    userId.value = ""; // Clear auto-generated userId
    remoteUsers.value.clear();
    isMicMuted.value = false;
    isCameraMuted.value = false;

    store.resetTalkState();

    showStatus(t("leftRoom"), "info");
  } catch (error: any) {
    showStatus(`${t("leaveFailed")}: ${error.message}`, "error");
  }
};

// ============================================
// UTILITIES
// ============================================

const showStatus = (message: string, type: string = "info") => {
  statusMessage.value = message;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = "";
  }, 3000);
};

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  initSocket();
});

onUnmounted(() => {
  if (isInRoom.value) {
    leaveRoom();
  } else {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
});
</script>

<style scoped>
.trtc-container {
  width: 500px;
  min-width: 500px;
  max-width: 500px;
  height: 500px;
  min-height: 500px;
  max-height: 500px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 10px;
  box-sizing: border-box;
}

/* Language Switcher */
.language-switcher {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  background: rgba(20, 20, 20, 0.8);
  border-radius: 20px;
  padding: 4px;
  z-index: 50;
}

.lang-btn {
  padding: 4px 10px;
  background: transparent;
  border: none;
  color: #999;
  font-size: 11px;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.2s;
}

.lang-btn.active {
  background: #1890ff;
  color: white;
}

.lang-btn:hover:not(.active) {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* Connection Status */
.connection-status {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  color: #ff4d4f;
  background: rgba(0, 0, 0, 0.6);
  padding: 3px 8px;
  border-radius: 12px;
  z-index: 50;
}

.connection-status.connected {
  color: #52c41a;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px;
  min-height: 400px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #888;
  font-size: 12px;
}

/* Role Selection */
/* Removed role selection styles */

/* User ID Input */
/* Removed user input styles */

/* Join Button */
/* Removed join button styles */

/* Server Dashboard */
.server-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.dashboard-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat {
  font-size: 10px;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
}

.stat.clients-stat {
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.stat.clients-stat:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.stat.request-count {
  color: #faad14;
  background: rgba(250, 173, 20, 0.1);
}

.stat.active-count {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

/* Toggle Sidebar Button */
/* Removed toggle-sidebar-btn styles - not needed anymore */

/* Video Sections */
.server-video-section,
.client-video-section {
  position: relative;
  flex: 1;
  min-height: 0;
  margin-bottom: 8px;
  overflow: hidden;
}

.main-video-area {
  width: 100%;
  height: 100%;
  /* max-height: 418px; */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-video {
  width: 100%;
  height: 100%;
  /* max-height: 408px; */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

/* Active Clients Video Grid */
.active-clients-grid {
  display: grid;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 6px;
}

.active-clients-grid.single {
  grid-template-columns: 1fr;
}

.active-clients-grid.multiple {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.active-client-video {
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  min-height: 100px;
}

.active-client-video .video-content {
  width: 100%;
  height: 100%;
}

.active-client-video .video-label {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
}

.end-client-call-btn {
  background: #ff4d4f;
  border: none;
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-client-call-btn:hover {
  background: #ff7875;
}

.video-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.small-text {
  font-size: 10px;
  color: #444;
}

.video-label {
  position: absolute;
  bottom: 0px;
  left: 0px;
  background: rgba(0, 0, 0, 0.7);
  padding: 1px 2px;
  border-radius: 4px;
  font-size: 10px;
}

.pip-video {
  position: absolute;
  bottom: 3px;
  right: 8px;
  width: 125px;
  height: 100px;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #333;
  z-index: 10;
}

.pip-video.active-client {
  right: 110px;
}

/* Centered Toggle Button - Top Center */
.sidebar-toggle-center {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle-center:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

.sidebar-toggle-center.open {
  background: rgba(24, 144, 255, 0.8);
  border-color: rgba(24, 144, 255, 0.5);
}

.sidebar-toggle-center.open:hover {
  background: rgba(24, 144, 255, 0.9);
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.sidebar-toggle-center.open .toggle-icon {
  transform: rotate(0deg);
}

.toggle-text {
  white-space: nowrap;
}

/* Remove the rule that moves button when sidebar opens */
/* The button stays in top center regardless of sidebar state */

/* Show Clients Toggle Button - Top Center */
.sidebar-toggle-top {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle-top:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

.sidebar-toggle-top.open {
  background: rgba(24, 144, 255, 0.8);
  border-color: rgba(24, 144, 255, 0.5);
}

.sidebar-toggle-top.open:hover {
  background: rgba(24, 144, 255, 0.9);
}

.sidebar-toggle-top .toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.sidebar-toggle-top .toggle-text {
  white-space: nowrap;
}

/* Remove the old sidebar-toggle-center styles */

/* Client Sidebar */
.client-sidebar {
  position: absolute;
  top: 0;
  right: -180px;
  width: 180px;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: right 0.3s ease;
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.5);
}

.client-sidebar.open {
  right: 0;
}

/* When sidebar is open, move toggle button to left edge of sidebar */
.client-sidebar.open ~ .server-video-section .sidebar-toggle-center {
  right: 180px;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-title {
  font-size: 12px;
  margin-bottom: 12px;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.client-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.client-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s;
}

.client-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.client-item.active {
  background: rgba(82, 196, 26, 0.15);
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.client-item.invited {
  background: rgba(250, 173, 20, 0.15);
  border: 1px solid rgba(250, 173, 20, 0.3);
}

.user-name {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-action-btn {
  width: 100%;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.client-action-btn.invite-btn {
  background: #52c41a;
  color: white;
}

.client-action-btn.invite-btn:hover {
  background: #73d13d;
}

.client-action-btn.end-btn {
  background: #ff4d4f;
  color: white;
}

.client-action-btn.end-btn:hover {
  background: #ff7875;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 20px 10px;
  font-size: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invited-status {
  padding: 6px 12px;
  background: rgba(250, 173, 20, 0.2);
  color: #faad14;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

/* Controls */
.server-controls,
.client-controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  white-space: nowrap;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.mic,
.control-btn.camera {
  background: #52c41a;
}

.control-btn.mic.muted,
.control-btn.camera.muted {
  background: #ff4d4f;
}

.control-btn.request-talk {
  background: #1890ff;
}

.control-btn.request-talk.pending {
  background: #faad14;
}

.control-btn.end-call {
  background: #ff4d4f;
}

.control-btn.leave {
  background: rgba(255, 255, 255, 0.1);
}

.call-status {
  display: flex;
  align-items: center;
  font-size: 10px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
}

/* Client View */
.client-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.client-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.status-info {
  display: flex;
  align-items: center;
}

.server-status {
  font-size: 10px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.server-status.waiting {
  color: #faad14;
  background: rgba(250, 173, 20, 0.1);
}

/* Invitation Modal */
.invitation-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #1f1f1f;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  max-width: 280px;
}

.invitation-icon {
  font-size: 36px;
  margin-bottom: 12px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-content h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.modal-content p {
  color: #888;
  font-size: 12px;
  margin-bottom: 16px;
}

.invitation-actions {
  display: flex;
  gap: 8px;
}

.btn-decline,
.btn-accept {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-decline {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-accept {
  background: #52c41a;
  color: white;
}

.btn-decline:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-accept:hover {
  background: #73d13d;
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 11px;
  z-index: 2000;
  max-width: 300px;
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.toast.info {
  background: #1890ff;
}
.toast.success {
  background: #52c41a;
}
.toast.error {
  background: #ff4d4f;
}

/* Server Controls Container - Two sections side by side */
.server-controls-container {
  display: flex;
  gap: 8px;
  width: 100%;
  flex-shrink: 0;
}

.controls-section {
  flex: 1;
  width: 50%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px;
  min-height: 120px;
  max-height: 120px;
}

/* Left Half: Buttons Section */
.buttons-section {
  justify-content: center;
}

.server-controls {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  white-space: nowrap;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.mic,
.control-btn.camera {
  background: #52c41a;
}

.control-btn.mic.muted,
.control-btn.camera.muted {
  background: #ff4d4f;
}

.control-btn.end-call {
  background: #ff4d4f;
}

.control-btn.leave {
  background: rgba(255, 255, 255, 0.1);
}

/* Right Half: Requests Section */
.requests-section {
  overflow-y: auto;
  max-height: 120px;
}

.requests-title {
  font-size: 11px;
  margin-bottom: 8px;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 10px;
}

.request-user-name {
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.request-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.request-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.request-btn.reject-btn {
  background: #ff4d4f;
  color: white;
}

.request-btn.reject-btn:hover {
  background: #ff7875;
}

.request-btn.accept-btn {
  background: #52c41a;
  color: white;
}

.request-btn.accept-btn:hover {
  background: #73d13d;
}

.requests-empty {
  text-align: center;
  color: #666;
  padding: 10px;
  font-size: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 600px) {
  .trtc-container {
    width: 600px;
    min-width: 600px;
    max-width: 600px;
    height: 500px;
    min-height: 500px;
    max-height: 500px;
  }

  .client-sidebar {
    width: 100%;
    right: -100%;
    top: 0;
    height: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .client-sidebar.open {
    right: 0;
  }

  .client-management {
    display: none;
  }

  .pip-video {
    width: 80px;
    height: 60px;
  }

  .pip-video.active-client {
    right: 90px;
  }
}

/* Client self video - in same line as other active clients */
.pip-video.client-self {
  position: absolute;
  bottom: 3px;
  right: 8px;
  width: 125px;
  height: 100px;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid #52c41a; /* Green border to indicate it's you */
  z-index: 15;
}

/* Position other active clients in same line (to the left of self video) */
.client-video-section .pip-video.active-client {
  bottom: 3px; /* Same bottom position as self video */
  /* right position is calculated inline based on index */
}

/* Join Room Interface */
.join-room-interface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 200;
}

.join-room-content {
  background: rgba(30, 30, 30, 0.95);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.join-room-header h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.join-room-header .subtitle {
  color: #888;
  font-size: 14px;
  margin-bottom: 30px;
}

.join-room-initial {
  display: flex;
  justify-content: center;
}

.join-room-btn {
  padding: 14px 32px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.join-room-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.join-room-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.input-group {
  display: flex;
  gap: 4px;
  flex-direction: column;
  text-align: left;
}

.join-room-form .input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.join-room-form .input-group label {
  font-size: 12px;
  color: #888;
}

.join-room-form .input-group label .required {
  color: #ff4444;
  margin-left: 2px;
}

.join-room-form .input-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  box-sizing: border-box;
}

.join-room-form .input-group input:focus {
  outline: none;
  border-color: #1890ff;
}

.join-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.join-btn {
  padding: 12px 24px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Join Preview Interface */
.join-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  opacity: 0.6; /* Slightly faded to show it's a preview */
}

.join-preview .dashboard-header {
  flex-shrink: 0;
}

.join-preview .server-video-section {
  flex: 1;
  min-height: 0;
  margin-bottom: 8px;
}

.join-preview .server-controls-container {
  flex-shrink: 0;
}

.preview-pip {
  opacity: 0.5;
  pointer-events: none;
}

.preview-content {
  background: rgba(255, 255, 255, 0.05);
}

.preview-btn {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Join Overlay */
.join-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 300;
  backdrop-filter: blur(2px);
}

.join-overlay-content {
  text-align: center;
}

.join-room-main-btn {
  padding: 16px 40px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.4);
}

.join-room-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(24, 144, 255, 0.6);
}

.join-form-overlay {
  background: rgba(30, 30, 30, 0.95);
  padding: 30px;
  border-radius: 16px;
  min-width: 280px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.join-form-content h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: white;
}

.join-form-content .input-group {
  margin-bottom: 20px;
}

.join-form-content .input-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  box-sizing: border-box;
}

.join-form-content .input-group input:focus {
  outline: none;
  border-color: #1890ff;
}

.join-form-content .join-actions {
  display: flex;
  gap: 12px;
}

.join-form-content .join-btn {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.join-form-content .join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.join-form-content .join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.join-form-content .cancel-btn {
  flex: 1;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.join-form-content .cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 400;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #fff;
  font-size: 14px;
}
</style>
