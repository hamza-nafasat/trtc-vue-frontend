// src/locales/zh.ts
export default {
  // Header
  appName: "腾讯实时音视频",

  // Room List
  roomList: "房间列表",
  noActiveRooms: "暂无活跃房间",
  createNewRoom: "创建新房间",
  room: "房间",
  participants: "位参与者",
  participant: "位参与者",

  // Buttons
  newRoom: "新建房间",
  joinRoom: "加入房间",
  schedule: "预约",
  leave: "离开",
  create: "创建",
  join: "加入",
  cancel: "取消",
  confirm: "确认",

  // Modal Titles
  createRoomTitle: "创建新房间",
  joinRoomTitle: "加入现有房间",

  // Form Labels
  yourUserId: "您的用户ID",
  roomId: "房间号",
  enterUserId: "请输入您的用户ID",
  enterRoomId: "请输入房间号",
  enterRoomIdJoin: "请输入要加入的房间号",
  roomIdPlaceholder: "请输入房间号（例如：1001）",

  // Video Labels
  you: "您",
  remote: "远程",
  yourCamera: "您的摄像头",
  noRoomAvailable: "暂无可播放的房间",
  waitingForOthers: "等待其他人加入...",

  // Device Controls
  mic: "麦克风",
  camera: "摄像头",

  // Status Messages
  creatingRoom: "正在创建房间...",
  joiningRoom: "正在加入房间...",
  roomCreated: "房间 {roomId} 创建成功！",
  joinedRoom: "已加入房间！",
  leftRoom: "已离开房间",
  userJoined: "{userId} 加入了",
  userLeft: "{userId} 离开了",
  videoConnected: "{userId} 视频已连接！",
  micMuted: "麦克风已静音",
  micUnmuted: "麦克风已取消静音",
  cameraOff: "摄像头已关闭",
  cameraOn: "摄像头已打开",
  waitingForAdmin: "等待管理员加入...",
  adminJoined: "管理员已加入房间！",

  // Errors
  enterBothIds: "请输入用户ID和房间号",
  backendError: "后端错误",
  failedToCreate: "创建房间失败：{message}",
  failedToJoin: "加入房间失败：{message}",
  failedToLoad: "加载房间列表失败",
  connectionFailed: "后端连接失败。请确保后端运行在3000端口。",

  // Features
  scheduleComingSoon: "预约功能即将推出！",

  // Language
  language: "语言",
  english: "English",
  chinese: "中文",

  // ================================
  // ONE-TO-ONE TALK SYSTEM
  // ================================

  // Connection
  connected: "已连接",
  disconnected: "已断开",

  // Role Selection
  oneToOneTalk: "一对一通话系统",
  serverRole: "服务端（控制台）",
  clientRole: "客户端（观众）",
  serverDescription: "控制直播，邀请客户通话",
  clientDescription: "观看直播，请求通话",
  joinAs: "加入为",
  server: "服务端",
  client: "客户端",
  joinedSuccessfully: "加入成功！",
  joinFailed: "加入失败",

  // Server Dashboard
  serverDashboard: "服务端控制台",
  clients: "个客户端",
  requests: "个请求",
  noActiveCall: "暂无通话",
  selectClientToStart: "选择一个客户端开始通话",
  talking: "通话中",

  // Talk Requests
  talkRequests: "通话请求",
  invite: "邀请",
  connectedClients: "已连接客户端",
  requested: "已请求",
  audience: "观众",
  noClientsYet: "暂无客户端连接",

  // Call Actions
  endCall: "结束通话",
  endCurrentCallFirst: "请先结束当前通话",
  invitationSent: "邀请已发送",
  callStarted: "通话已开始",
  callEnded: "通话已结束",

  // Client View
  clientView: "客户端视图",
  waitingForServer: "等待服务端...",
  serverVideo: "服务端视频",
  waitingForServerVideo: "等待服务端开始直播",

  // Talk Request
  requestTalk: "请求通话",
  cancelRequest: "取消请求",
  requestSubmitted: "通话请求已提交",
  requestCancelled: "通话请求已取消",
  isTalking: "正在与服务端通话",

  // Invitation
  invitationReceived: "收到邀请！",
  serverInviting: "服务端正在邀请您通话",
  accept: "接受",
  decline: "拒绝",
  declinedInvitation: "拒绝了邀请",

  // Publishing
  publishFailed: "发布失败",

  // Disconnection
  serverDisconnected: "服务端已断开连接",
  disconnectedDuringCall: "在通话中断开连接",
  leaveFailed: "离开房间失败",

  // General
  joined: "加入了",
  left: "离开了",

  // Password
  adminPassword: "管理员密码",
  enterAdminPassword: "请输入管理员密码",
  invalidPassword: "管理员密码无效",

  // Talk Request Actions
  reject: "拒绝",
  requestRejected: "请求已拒绝",
  yourRequestRejected: "您的通话请求已被拒绝",

  // Multiple Clients Support
  activeCalls: "通话中",
  endAllCalls: "结束所有通话",
  joinedCall: "加入了通话",
  areTalking: "正在与服务端通话",
  clientAlreadyInCall: "该客户端已在通话中",
  joinedCallMuted: "已加入通话 - 摄像头和麦克风已关闭。请手动开启。",

  // Server Errors
  serverAlreadyExists: "服务端已存在。同一时间只允许一个服务端连接。",

  // Additional translations needed
  showClients: "👥 客户端",
  hideClients: "👥 客户端",
  noRequests: "暂无请求",
  joinToStart: "加入以开始",
  clickJoinRoomToEnter: "点击'加入房间'进入",
  joinToSeeRequests: "加入以查看请求",
  enterYourId: "输入您的ID",
  invited: "已邀请",

  // User ID validation
  userIdAlreadyExists: "此用户ID已存在。请输入唯一的ID。",
  enterPassword: "输入密码",
  invalidCredentials: "无效的用户ID或密码。请检查您的凭据。",
};
