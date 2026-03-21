import { create } from "zustand";

// DỮ LIỆU GIẢ LẬP
const mockRooms = [
  {
    id: "room_1",
    title: "Gió Vẫn Hát - Acoustic Jam",
    tempo: 120,
    timeSignature: "4/4",
    tracks: [
      {
        id: 1,
        instrument: "Piano Grand",
        user: "le duy phuong ha",
        avatar: "https://github.com/shadcn.png",
        waveColor: "#3b82f6",
        volume: 80,
        activeRecordId: "r2",
        records: [
          { id: "r1", name: "Take 1 (Bản nháp êm dịu)" },
          {
            id: "r2",
            name: "Take 2 (Chơi mạnh hơn)",
            audioUrl: "/test_piano_sach.wav",
          },
        ],
      },
      {
        id: 2,
        instrument: "Acoustic Guitar",
        user: "Anais desiree",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        waveColor: "#10b981",
        volume: 75,
        activeRecordId: "g1",
        records: [
          {
            id: "g1",
            name: "Đánh quạt chả",
            audioUrl: "/test_piano_on.wav",
          },
        ],
        clips: [{ start: "10%", width: "60%" }],
      },
    ],
  },
  {
    id: "room_2",
    title: "River Flows In You - Lofi",
    tempo: 85,
    timeSignature: "4/4",
    tracks: [
      {
        id: 3,
        instrument: "Lofi Beat",
        user: "ProducerX",
        avatar: "",
        waveColor: "#8b5cf6",
        volume: 60,
        activeRecordId: null,
        records: [],
      },
    ],
  },
];

export const useJamStore = create((set, get) => ({
  // === 1. TRẠNG THÁI ===
  rooms: mockRooms,
  activeRoom: mockRooms[0],
  currentTracks: mockRooms[0].tracks,
  isPlaying: false,
  masterVolume: 100,

  // === 2. HÀNH ĐỘNG ===
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  switchRoom: (roomId) => {
    const room = get().rooms.find((r) => r.id === roomId);
    if (room) {
      set({
        activeRoom: room,
        currentTracks: room.tracks,
        isPlaying: false,
      });
    }
  },

  changeActiveRecord: (trackId, recordId) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) =>
        t.id === trackId ? { ...t, activeRecordId: recordId } : t,
      ),
    }));
  },

  setMasterVolume: (value) => set({ masterVolume: value }),

  setTrackVolume: (trackId, volume) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) =>
        t.id === trackId ? { ...t, volume: volume } : t,
      ),
    }));
  },
}));
