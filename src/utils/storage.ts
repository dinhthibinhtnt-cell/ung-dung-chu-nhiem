import { AppState, Criteria, Group, Student, AttendanceRecord, ConductEntry, RewardRecord, DisciplineRecord } from '../types';

export const STORAGE_KEY = 'tro_ly_chu_nhiem_12a9_data_v2';

export const DEFAULT_GROUPS: Group[] = [
  { id: 'to-1', name: 'Tổ 1 (Tiên Phong)', colorTag: 'border-blue-500 bg-blue-50 text-blue-700', note: 'Dãy 1 sát cửa sổ' },
  { id: 'to-2', name: 'Tổ 2 (Đoàn Kết)', colorTag: 'border-emerald-500 bg-emerald-50 text-emerald-700', note: 'Dãy 2 trung tâm' },
  { id: 'to-3', name: 'Tổ 3 (Chăm Ngoan)', colorTag: 'border-amber-500 bg-amber-50 text-amber-700', note: 'Dãy 3 trung tâm' },
  { id: 'to-4', name: 'Tổ 4 (Bứt Phá)', colorTag: 'border-purple-500 bg-purple-50 text-purple-700', note: 'Dãy 4 sát cửa ra vào' },
];

export const DEFAULT_CRITERIA: Criteria[] = [
  // Chuyên cần
  { id: 'c-cc-1', code: 'CC01', name: 'Đi học đúng giờ, chuyên cần tuần', category: 'chuyen_can', pointsDelta: 2, targetScope: 'student', enabled: true, description: 'Chuyên cần tốt không muộn ngày nào' },
  { id: 'c-cc-2', code: 'CC02', name: 'Đi học muộn', category: 'chuyen_can', pointsDelta: -2, targetScope: 'student', enabled: true, description: 'Đến sau tiếng trống truy bài' },
  { id: 'c-cc-3', code: 'CC03', name: 'Nghỉ học có phép', category: 'chuyen_can', pointsDelta: -1, targetScope: 'student', enabled: true, description: 'Có đơn/tin nhắn phụ huynh hợp lệ' },
  { id: 'c-cc-4', code: 'CC04', name: 'Nghỉ học không phép', category: 'chuyen_can', pointsDelta: -5, targetScope: 'student', enabled: true, description: 'Vắng không lý do' },
  { id: 'c-cc-5', code: 'CC05', name: 'Trốn tiết / ra ngoài không xin phép', category: 'chuyen_can', pointsDelta: -10, targetScope: 'student', enabled: true, description: 'Vi phạm nghiêm trọng thời gian học' },

  // Nề nếp
  { id: 'c-nn-1', code: 'NN01', name: 'Đồng phục, phù hiệu nghiêm túc', category: 'ne_nep', pointsDelta: 2, targetScope: 'student', enabled: true, description: 'Đầy đủ áo, quần, dép/giày đúng quy định' },
  { id: 'c-nn-2', code: 'NN02', name: 'Vi phạm đồng phục / thiếu phù hiệu', category: 'ne_nep', pointsDelta: -2, targetScope: 'student', enabled: true, description: 'Không mặc đúng đồng phục quy định' },
  { id: 'c-nn-3', code: 'NN03', name: 'Mất trật tự trong giờ học', category: 'ne_nep', pointsDelta: -3, targetScope: 'student', enabled: true, description: 'Bị thầy cô bộ môn nhắc nhở' },
  { id: 'c-nn-4', code: 'NN04', name: 'Dùng điện thoại ngoài giờ cho phép', category: 'ne_nep', pointsDelta: -5, targetScope: 'student', enabled: true, description: 'Dùng điện thoại chơi game/lướt mạng trong lớp' },
  { id: 'c-nn-5', code: 'NN05', name: 'Mang đầy đủ SGK & dụng cụ học tập', category: 'ne_nep', pointsDelta: 1, targetScope: 'student', enabled: true, description: 'Tác phong chuẩn bị chu đáo' },
  { id: 'c-nn-6', code: 'NN06', name: 'Quên sách vở / không soạn bài', category: 'ne_nep', pointsDelta: -2, targetScope: 'student', enabled: true, description: 'Thiếu tài liệu học tập' },

  // Học tập
  { id: 'c-ht-1', code: 'HT01', name: 'Điểm kiểm tra xuất sắc (9.0 - 10)', category: 'hoc_tap', pointsDelta: 5, targetScope: 'student', enabled: true, description: 'Điểm 9 hoặc 10 ở bài kiểm tra miệng/15p/1 tiết' },
  { id: 'c-ht-2', code: 'HT02', name: 'Điểm kiểm tra giỏi (8.0 - 8.9)', category: 'hoc_tap', pointsDelta: 2, targetScope: 'student', enabled: true, description: 'Điểm 8 đến 8.9' },
  { id: 'c-ht-3', code: 'HT03', name: 'Tích cực hăng hái phát biểu xây dựng bài', category: 'hoc_tap', pointsDelta: 2, targetScope: 'student', enabled: true, description: 'Được giáo viên bộ môn khen ngợi' },
  { id: 'c-ht-4', code: 'HT04', name: 'Không làm bài tập về nhà / không học bài cũ', category: 'hoc_tap', pointsDelta: -3, targetScope: 'student', enabled: true, description: 'Bị ghi vào sổ đầu bài' },
  { id: 'c-ht-5', code: 'HT05', name: 'Điểm dưới trung bình (< 5.0)', category: 'hoc_tap', pointsDelta: -3, targetScope: 'student', enabled: true, description: 'Cần kèm cặp và bổ trợ kiến thức' },

  // Vệ sinh & Lao động
  { id: 'c-vs-1', code: 'VS01', name: 'Trực nhật lớp sạch sẽ, đúng giờ', category: 've_sinh', pointsDelta: 5, targetScope: 'group', enabled: true, description: 'Lau bảng, giặt giẻ, quét lớp, đổ rác sạch sẽ' },
  { id: 'c-vs-2', code: 'VS02', name: 'Trực nhật bẩn / trễ giờ / bỏ trực nhật', category: 've_sinh', pointsDelta: -5, targetScope: 'group', enabled: true, description: 'Để lớp bẩn bị cờ đỏ trường nhắc' },
  { id: 'c-vs-3', code: 'VS03', name: 'Tự giác nhặt rác, giữ gìn tài sản chung', category: 've_sinh', pointsDelta: 2, targetScope: 'student', enabled: true, description: 'Ý thức giữ gìn vệ sinh lớp học xuất sắc' },

  // Hoạt động tập thể & Khen thưởng
  { id: 'c-kt-1', code: 'KT01', name: 'Tuyên dương việc tốt / Nhặt được của rơi', category: 'khen_thuong', pointsDelta: 10, targetScope: 'student', enabled: true, description: 'Hành động đẹp, gương người tốt việc tốt' },
  { id: 'c-kt-2', code: 'KT02', name: 'Tham gia sôi nổi phong trào Đoàn / Thể thao', category: 'tap_the', pointsDelta: 5, targetScope: 'student', enabled: true, description: 'Đại diện lớp thi đấu hoặc biểu diễn' },
  { id: 'c-kt-3', code: 'KT03', name: 'Đôi bạn cùng tiến - Giúp bạn tiến bộ', category: 'khen_thuong', pointsDelta: 5, targetScope: 'student', enabled: true, description: 'Kèm cặp bạn yếu vươn lên đạt điểm khá' },
  { id: 'c-kt-4', code: 'KT04', name: 'Gương mẫu tuần / Cán sự lớp trách nhiệm', category: 'y_thuc', pointsDelta: 4, targetScope: 'student', enabled: true, description: 'Hoàn thành xuất sắc nhiệm vụ được giao' },

  // Vi phạm
  { id: 'c-vp-1', code: 'VP01', name: 'Gian lận trong kiểm tra / thi cử', category: 'vi_pham', pointsDelta: -10, targetScope: 'student', enabled: true, description: 'Vi phạm quy chế thi' },
  { id: 'c-vp-2', code: 'VP02', name: 'Nói tục, gây mất đoàn kết bạn bè', category: 'vi_pham', pointsDelta: -5, targetScope: 'student', enabled: true, description: 'Nhắc nhở và cam kết không tái phạm' },
];

export const SAMPLE_STUDENTS: Student[] = [
  // Tổ 1
  { id: 'hs-01', studentCode: '12A9-01', fullName: 'Đỗ Thị Thảo Vy', gender: 'Nu', groupId: 'to-1', role: 'Lớp trưởng', phoneParent: '0912345671', notes: 'Lớp trưởng gương mẫu, quản lý và chỉ huy tốt các hoạt động' },
  { id: 'hs-02', studentCode: '12A9-02', fullName: 'Trần Khánh Linh', gender: 'Nu', groupId: 'to-1', role: 'Bí thư Chi đoàn', phoneParent: '0912345672', notes: 'Năng nổ phong trào Đoàn trường' },
  { id: 'hs-03', studentCode: '12A9-03', fullName: 'Đặng Minh Đức', gender: 'Nam', groupId: 'to-1', role: 'Tổ trưởng', phoneParent: '0912345673', notes: 'Quản lý Tổ 1 nề nếp' },
  { id: 'hs-04', studentCode: '12A9-04', fullName: 'Phạm Thu Phương', gender: 'Nu', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345674', notes: 'Học chắc môn Tiếng Anh' },
  { id: 'hs-05', studentCode: '12A9-05', fullName: 'Lê Tuấn Kiệt', gender: 'Nam', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345675', notes: 'Thành viên đội bóng rổ trường' },
  { id: 'hs-06', studentCode: '12A9-06', fullName: 'Vũ Thảo My', gender: 'Nu', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345676', notes: 'Khéo tay, trang trí bảng giỏi' },
  { id: 'hs-07', studentCode: '12A9-07', fullName: 'Bùi Đức Anh', gender: 'Nam', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345677', notes: 'Tiến bộ rõ rệt môn Toán' },
  { id: 'hs-08', studentCode: '12A9-08', fullName: 'Hoàng Ngọc Ánh', gender: 'Nu', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345678', notes: 'Chăm chỉ, đi học đúng giờ' },
  { id: 'hs-09', studentCode: '12A9-09', fullName: 'Ngô Gia Huy', gender: 'Nam', groupId: 'to-1', role: 'Thành viên', phoneParent: '0912345679', notes: 'Cần chú ý bài tập Lý' },

  // Tổ 2
  { id: 'hs-10', studentCode: '12A9-10', fullName: 'Lê Thu Hà', gender: 'Nu', groupId: 'to-2', role: 'Lớp phó học tập', phoneParent: '0912345680', notes: 'Học lực xuất sắc, cán sự khối A' },
  { id: 'hs-11', studentCode: '12A9-11', fullName: 'Đỗ Quang Minh', gender: 'Nam', groupId: 'to-2', role: 'Tổ trưởng', phoneParent: '0912345681', notes: 'Điều hành Tổ 2 sôi nổi' },
  { id: 'hs-12', studentCode: '12A9-12', fullName: 'Nguyễn Bích Ngọc', gender: 'Nu', groupId: 'to-2', role: 'Cán sự môn', phoneParent: '0912345682', notes: 'Cán sự môn Ngữ Văn' },
  { id: 'hs-13', studentCode: '12A9-13', fullName: 'Trần Văn Nam', gender: 'Nam', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345683', notes: 'Hát hay, hay biểu diễn văn nghệ' },
  { id: 'hs-14', studentCode: '12A9-14', fullName: 'Phan Thanh Thảo', gender: 'Nu', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345684', notes: 'Ghi chép bài cẩn thận' },
  { id: 'hs-15', studentCode: '12A9-15', fullName: 'Vũ Trọng Khang', gender: 'Nam', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345685', notes: 'Thỉnh thoảng hay quên thước kẻ' },
  { id: 'hs-16', studentCode: '12A9-16', fullName: 'Dương Yến Nhi', gender: 'Nu', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345686', notes: 'Năng nổ trong thảo luận nhóm' },
  { id: 'hs-17', studentCode: '12A9-17', fullName: 'Mai Thế Bảo', gender: 'Nam', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345687', notes: 'Thành viên đội tuyển Hóa' },
  { id: 'hs-18', studentCode: '12A9-18', fullName: 'Lý Quỳnh Chi', gender: 'Nu', groupId: 'to-2', role: 'Thành viên', phoneParent: '0912345688', notes: 'Tác phong nhẹ nhàng, lễ phép' },

  // Tổ 3
  { id: 'hs-19', studentCode: '12A9-19', fullName: 'Trịnh Quốc Hưng', gender: 'Nam', groupId: 'to-3', role: 'Lớp phó lao động', phoneParent: '0912345689', notes: 'Quản lý lao động trực nhật rất chu đáo' },
  { id: 'hs-20', studentCode: '12A9-20', fullName: 'Phạm Hồng Nhung', gender: 'Nu', groupId: 'to-3', role: 'Tổ trưởng', phoneParent: '0912345690', notes: 'Tổ trưởng gương mẫu, kiểm tra bài đầu giờ' },
  { id: 'hs-21', studentCode: '12A9-21', fullName: 'Võ Đình Trọng', gender: 'Nam', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345691', notes: 'Có khiếu thể dục thể thao' },
  { id: 'hs-22', studentCode: '12A9-22', fullName: 'Nguyễn Thùy Trang', gender: 'Nu', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345692', notes: 'Điểm Toán tăng đáng kể' },
  { id: 'hs-23', studentCode: '12A9-23', fullName: 'Đinh Nhật Nam', gender: 'Nam', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345693', notes: 'Hơi nhút nhát, cần khuyến khích phát biểu' },
  { id: 'hs-24', studentCode: '12A9-24', fullName: 'Lê Minh Anh', gender: 'Nu', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345694', notes: 'Tham gia tích cực câu lạc bộ Tiếng Anh' },
  { id: 'hs-25', studentCode: '12A9-25', fullName: 'Tạ Hoàng Phúc', gender: 'Nam', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345695', notes: 'Ý thức tự giác cao' },
  { id: 'hs-26', studentCode: '12A9-26', fullName: 'Hà Kiều Oanh', gender: 'Nu', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345696', notes: 'Trách nhiệm cao khi được phân công' },
  { id: 'hs-27', studentCode: '12A9-27', fullName: 'Đặng Quốc Huy', gender: 'Nam', groupId: 'to-3', role: 'Thành viên', phoneParent: '0912345697', notes: 'Cần nhắc nhở giữ trật tự tiết Sinh' },

  // Tổ 4
  { id: 'hs-28', studentCode: '12A9-28', fullName: 'Nguyễn Tấn Dũng', gender: 'Nam', groupId: 'to-4', role: 'Lớp phó văn thể mỹ', phoneParent: '0912345698', notes: 'Nhiệt tình hoạt động phong trào' },
  { id: 'hs-29', studentCode: '12A9-29', fullName: 'Trương Mỹ Linh', gender: 'Nu', groupId: 'to-4', role: 'Tổ trưởng', phoneParent: '0912345699', notes: 'Chỉn chu, nhắc nhở các bạn trong tổ' },
  { id: 'hs-30', studentCode: '12A9-30', fullName: 'Phan Viết Khôi', gender: 'Nam', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345700', notes: 'Tư duy Toán và Tin học nhạy bén' },
  { id: 'hs-31', studentCode: '12A9-31', fullName: 'Bùi Thảo Trang', gender: 'Nu', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345701', notes: 'Chăm chỉ, làm việc nhóm tốt' },
  { id: 'hs-32', studentCode: '12A9-32', fullName: 'Vũ Tuấn Đạt', gender: 'Nam', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345702', notes: 'Gần đây đi học rất đúng giờ' },
  { id: 'hs-33', studentCode: '12A9-33', fullName: 'Ngô Phương Thảo', gender: 'Nu', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345703', notes: 'Vở sạch chữ đẹp' },
  { id: 'hs-34', studentCode: '12A9-34', fullName: 'Lê Duy Khánh', gender: 'Nam', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345704', notes: 'Có nhiều ý kiến hay trong tiết Địa' },
  { id: 'hs-35', studentCode: '12A9-35', fullName: 'Cao Kim Ngân', gender: 'Nu', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345705', notes: 'Điểm tổng kết Văn cao' },
  { id: 'hs-36', studentCode: '12A9-36', fullName: 'Hoàng Văn Toàn', gender: 'Nam', groupId: 'to-4', role: 'Thành viên', phoneParent: '0912345706', notes: 'Hay giúp bạn trực nhật' },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecentDates(count: number = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export function createInitialSampleState(): AppState {
  const today = getTodayDateString();
  const recentDays = getRecentDates(6);

  // Generate realistic sample attendance for today & recent days
  const sampleAttendance: AttendanceRecord[] = [];
  
  // Today's attendance
  SAMPLE_STUDENTS.forEach((st, idx) => {
    let status: 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave' = 'present';
    let note = '';
    if (idx === 8) {
      status = 'late';
      note = 'Đến muộn 10 phút do hỏng xe';
    } else if (idx === 14) {
      status = 'excused';
      note = 'Ốm xin phép qua Zalo phụ huynh';
    } else if (idx === 26) {
      status = 'late';
      note = 'Đi muộn 5 phút tiết 1';
    }
    sampleAttendance.push({
      id: `att-today-${st.id}`,
      date: today,
      studentId: st.id,
      status,
      note,
    });
  });

  // Yesterday's attendance
  if (recentDays.length > 1) {
    const yesterday = recentDays[recentDays.length - 2];
    SAMPLE_STUDENTS.forEach((st, idx) => {
      let status: 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave' = 'present';
      let note = '';
      if (idx === 4) {
        status = 'excused';
        note = 'Đi khám răng có giấy hẹn';
      }
      sampleAttendance.push({
        id: `att-yest-${st.id}`,
        date: yesterday,
        studentId: st.id,
        status,
        note,
      });
    });
  }

  // Sample Conduct Entries
  const sampleConduct: ConductEntry[] = [
    {
      id: 'cnd-01',
      date: today,
      targetType: 'student',
      targetId: 'hs-10',
      criteriaId: 'c-ht-1',
      criteriaName: 'Điểm kiểm tra xuất sắc (9.0 - 10)',
      category: 'hoc_tap',
      pointsDelta: 5,
      note: 'Điểm 10 miệng môn Toán',
    },
    {
      id: 'cnd-02',
      date: today,
      targetType: 'group',
      targetId: 'to-1',
      criteriaId: 'c-vs-1',
      criteriaName: 'Trực nhật lớp sạch sẽ, đúng giờ',
      category: 've_sinh',
      pointsDelta: 5,
      note: 'Tổ 1 trực nhật xuất sắc, bàn ghế ngay ngắn',
    },
    {
      id: 'cnd-03',
      date: today,
      targetType: 'student',
      targetId: 'hs-01',
      criteriaId: 'c-nn-1',
      criteriaName: 'Đồng phục, phù hiệu nghiêm túc',
      category: 'ne_nep',
      pointsDelta: 2,
      note: 'Gương mẫu trong giờ truy bài',
    },
    {
      id: 'cnd-04',
      date: today,
      targetType: 'student',
      targetId: 'hs-08',
      criteriaId: 'c-cc-2',
      criteriaName: 'Đi học muộn',
      category: 'chuyen_can',
      pointsDelta: -2,
      note: 'Đến muộn tiết 1',
    },
    {
      id: 'cnd-05',
      date: today,
      targetType: 'student',
      targetId: 'hs-02',
      criteriaId: 'c-kt-2',
      criteriaName: 'Tham gia sôi nổi phong trào Đoàn',
      category: 'tap_the',
      pointsDelta: 5,
      note: 'Chuẩn bị kế hoạch văn nghệ chào mừng 20/11',
    },
  ];

  // Sample Rewards
  const sampleRewards: RewardRecord[] = [
    {
      id: 'rew-01',
      date: today,
      studentId: 'hs-10',
      title: 'Đạt điểm 10 tuyệt đối bài khảo sát Toán THPT',
      category: 'hoc_tap',
      pointsDelta: 10,
      description: 'Lê Thu Hà dẫn đầu khối bài kiểm tra khảo sát Toán',
      honoredInMeeting: true,
    },
    {
      id: 'rew-02',
      date: today,
      studentId: 'hs-19',
      title: 'Tự giác sửa chữa bàn ghế và quản lý lao động tận tụy',
      category: 'trach_nhiem',
      pointsDelta: 5,
      description: 'Trịnh Quốc Hưng chủ động kê lại bàn ghế sau giờ học',
      honoredInMeeting: true,
    },
    {
      id: 'rew-03',
      date: today,
      studentId: 'hs-07',
      title: 'Tiến bộ vượt bậc trong tháng - tăng 2 bậc điểm Toán',
      category: 'tien_bo',
      pointsDelta: 5,
      description: 'Bùi Đức Anh chăm chỉ học nhóm cùng các bạn',
      honoredInMeeting: true,
    },
  ];

  // Sample Discipline Records (Educational & humane tone)
  const sampleDiscipline: DisciplineRecord[] = [
    {
      id: 'disc-01',
      date: today,
      studentId: 'hs-09',
      title: 'Chưa chuẩn bị bài tập môn Vật lý',
      severity: 'nhac_nho',
      pointsDelta: -2,
      actionTaken: 'Giáo viên chủ nhiệm trao đổi riêng, phân công bạn Minh Đức (Tổ 1) kèm thêm',
      notes: 'Học sinh cam kết hoàn thành bù trong ngày mai',
      resolved: false,
    },
    {
      id: 'disc-02',
      date: today,
      studentId: 'hs-27',
      title: 'Nói chuyện trong tiết học môn Sinh học',
      severity: 'nhac_nho',
      pointsDelta: -3,
      actionTaken: 'Nhắc nhở nhẹ nhàng, đổi chỗ ngồi sang cạnh bạn Tổ trưởng',
      notes: 'Đã nhận lỗi và có thái độ tiếp thu tốt',
      resolved: true,
    },
  ];

  return {
    config: {
      className: '12A9',
      schoolName: 'THPT Trần Nhân Tông',
      schoolYear: '2026 - 2027',
      semester: 'Học kỳ I',
      homeroomTeacher: 'Đinh Thị Bính',
      motto: 'Kỷ cương - Đoàn kết - Quyết tâm bứt phá đại học!',
      baselineStudentPoints: 100,
      enableLeaderboard: true,
      themeColor: 'indigo',
      soundEnabled: true,
      ambientMusicEnabled: false,
      projectorMode: false,
    },
    groups: DEFAULT_GROUPS,
    students: SAMPLE_STUDENTS,
    criteriaList: DEFAULT_CRITERIA,
    attendanceRecords: sampleAttendance,
    conductEntries: sampleConduct,
    rewardRecords: sampleRewards,
    disciplineRecords: sampleDiscipline,
    quickReminders: [
      { id: 'rem-1', text: 'Nhắc nhở 4 tổ trưởng kiểm tra vở ghi và đồng phục đầu tuần', completed: false, priority: 'high', dueDate: today },
      { id: 'rem-2', text: 'Hoàn thành nộp danh sách đoàn viên ưu tú cho Đoàn trường', completed: true, priority: 'medium', dueDate: today },
      { id: 'rem-3', text: 'Chuẩn bị chủ đề tiết sinh hoạt: "Phương pháp ôn thi tốt nghiệp THPT hiệu quả"', completed: false, priority: 'high' },
      { id: 'rem-4', text: 'Gọi điện hỏi thăm tình hình phụ huynh em Lê Tuấn Kiệt nghỉ ốm', completed: false, priority: 'medium' },
    ],
    weeklyMeeting: {
      weekNumber: 4,
      date: today,
      title: 'Tiết Sinh Hoạt Tuần 4 - Đánh giá thi đua & Định hướng học tập',
      reviewSummary: 'Toàn lớp duy trì tốt nề nếp truy bài, các tổ vệ sinh trực nhật sạch sẽ. Tỷ lệ chuyên cần đạt trên 97%. Tuy nhiên một số bạn vẫn còn quên máy tính và sách bài tập.',
      strengths: 'Tổ 1 và Tổ 2 dẫn đầu phong trào học tập. Tinh thần đoàn kết hỗ trợ bạn bè rất cao. Đoàn trường đánh giá cao nề nếp giờ chào cờ.',
      weaknesses: 'Còn 2 trường hợp đi muộn giờ truy bài. Trong giờ tự quản một số bạn nam còn mất tập trung trao đổi riêng.',
      nextWeekPlan: 'Tập trung ôn tập bài kiểm tra giữa kỳ môn Toán và Anh. Giữ vững vị trí thi đua top 3 toàn trường. Tiếp tục thực hiện tốt phong trào Đôi bạn cùng tiến.',
      honoredStudentIds: ['hs-10', 'hs-01', 'hs-07'],
      honoredGroupId: 'to-1',
      assignedTasks: [
        { id: 'task-1', title: 'Kiểm tra sĩ số và trang phục các buổi sáng', assignee: 'Lớp trưởng Đỗ Thị Thảo Vy', deadline: 'Cả tuần', status: 'in_progress' },
        { id: 'task-2', title: 'Lập danh sách các bạn cần hỗ trợ ôn tập môn Toán', assignee: 'Lớp phó Lê Thu Hà', deadline: 'Thứ Năm', status: 'pending' },
        { id: 'task-3', title: 'Vệ sinh và kiểm tra trang thiết bị máy chiếu lớp học', assignee: 'Tổ 4 trực nhật', deadline: 'Thứ Sáu', status: 'pending' },
      ],
    },
  };
}

export const generateDefaultAppState = createInitialSampleState;

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return createInitialSampleState();
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if previous version storage exists
      const oldRaw = localStorage.getItem('tro_ly_chu_nhiem_12a9_data_v1');
      if (oldRaw) {
        try {
          const oldData = JSON.parse(oldRaw);
          if (oldData.config?.homeroomTeacher === 'Nguyễn Thị Minh Hạnh' || !oldData.config?.homeroomTeacher) {
            oldData.config.homeroomTeacher = 'Đinh Thị Bính';
          }
          if (oldData.config?.schoolName === 'Trường THPT Chuyên / THPT' || !oldData.config?.schoolName) {
            oldData.config.schoolName = 'THPT Trần Nhân Tông';
          }
          if (Array.isArray(oldData.students)) {
            oldData.students = oldData.students.map((s: Student) => {
              if (s.role === 'Lớp trưởng' && (s.fullName === 'Nguyễn Hoàng Long' || s.id === 'hs-01')) {
                return { ...s, fullName: 'Đỗ Thị Thảo Vy', gender: 'Nu' };
              }
              return s;
            });
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(oldData));
          return {
            ...createInitialSampleState(),
            ...oldData,
            config: { ...createInitialSampleState().config, ...(oldData.config || {}) },
          };
        } catch {
          // fallback to fresh sample
        }
      }

      const initial = createInitialSampleState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const initialDefault = createInitialSampleState();
    const mergedConfig = { ...initialDefault.config, ...(parsed.config || {}) };
    
    // Auto-update if it still has placeholder teacher or old school name
    if (mergedConfig.homeroomTeacher === 'Nguyễn Thị Minh Hạnh') {
      mergedConfig.homeroomTeacher = 'Đinh Thị Bính';
    }
    if (mergedConfig.schoolName === 'Trường THPT Chuyên / THPT') {
      mergedConfig.schoolName = 'THPT Trần Nhân Tông';
    }

    let updatedStudents = parsed.students || initialDefault.students;
    if (Array.isArray(updatedStudents)) {
      updatedStudents = updatedStudents.map((s: Student) => {
        if (s.role === 'Lớp trưởng' && s.fullName === 'Nguyễn Hoàng Long') {
          return { ...s, fullName: 'Đỗ Thị Thảo Vy', gender: 'Nu' };
        }
        return s;
      });
    }

    return {
      ...initialDefault,
      ...parsed,
      config: mergedConfig,
      students: updatedStudents,
    };
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ localStorage:', err);
    return createInitialSampleState();
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err);
  }
}

export function exportAppState(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TroLyChuNhiem_${state.config.className || '12A9'}_${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStudentsToCsv(state: AppState): void {
  const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Giới Tính', 'Tổ', 'Chức Vụ', 'SĐT Phụ Huynh', 'Ghi Chú'];
  const rows = state.students.map((s, idx) => {
    const group = state.groups.find(g => g.id === s.groupId)?.name || s.groupId;
    return [
      idx + 1,
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      s.gender === 'Nam' ? 'Nam' : 'Nữ',
      `"${group}"`,
      `"${s.role}"`,
      `"${s.phoneParent || ''}"`,
      `"${s.notes || ''}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DanhSachHocSinh_${state.config.className}_${getTodayDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function calculateStudentPoints(studentId: string, state: AppState): { total: number; bonus: number; penalty: number } {
  let bonus = 0;
  let penalty = 0;

  // From conduct entries
  state.conductEntries.forEach(entry => {
    if (entry.targetType === 'student' && entry.targetId === studentId) {
      if (entry.pointsDelta > 0) bonus += entry.pointsDelta;
      else penalty += Math.abs(entry.pointsDelta);
    }
  });

  // From rewards
  state.rewardRecords.forEach(rew => {
    if (rew.studentId === studentId) {
      bonus += Math.max(0, rew.pointsDelta);
    }
  });

  // From discipline
  state.disciplineRecords.forEach(disc => {
    if (disc.studentId === studentId) {
      penalty += Math.abs(disc.pointsDelta);
    }
  });

  // From attendance penalties
  state.attendanceRecords.forEach(att => {
    if (att.studentId === studentId) {
      if (att.status === 'late') penalty += 2;
      else if (att.status === 'excused') penalty += 1;
      else if (att.status === 'unexcused') penalty += 5;
    }
  });

  const baseline = state.config.baselineStudentPoints || 100;
  const total = baseline + bonus - penalty;
  return { total, bonus, penalty };
}

export function calculateGroupPoints(groupId: string, state: AppState): {
  total: number;
  bonus: number;
  penalty: number;
  studentCount: number;
  averageStudentPoints: number;
} {
  const studentsInGroup = state.students.filter(s => s.groupId === groupId);
  const studentCount = studentsInGroup.length;

  let totalStudentPoints = 0;
  studentsInGroup.forEach(s => {
    const pts = calculateStudentPoints(s.id, state);
    totalStudentPoints += pts.total;
  });

  const averageStudentPoints = studentCount > 0 ? Math.round((totalStudentPoints / studentCount) * 10) / 10 : 100;

  // Group direct conduct points (e.g. hygiene directly awarded to Group)
  let groupBonus = 0;
  let groupPenalty = 0;
  state.conductEntries.forEach(entry => {
    if (entry.targetType === 'group' && entry.targetId === groupId) {
      if (entry.pointsDelta > 0) groupBonus += entry.pointsDelta;
      else groupPenalty += Math.abs(entry.pointsDelta);
    }
  });

  const total = Math.round((averageStudentPoints + groupBonus - groupPenalty) * 10) / 10;
  return {
    total,
    bonus: groupBonus,
    penalty: groupPenalty,
    studentCount,
    averageStudentPoints,
  };
}
