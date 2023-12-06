import React, { useState, useEffect } from 'react';
import './App.css'; // CSS 스타일시트를 임포트합니다.

// 성적 계산 함수를 수정하여 1학점인 경우 Pass/Non Pass 처리
const calculateGrade = (course) => {
  const numericCredit = parseInt(course.credit, 10);
  if (numericCredit === 1) {
    return course.total >= 60 ? 'Pass' : 'Non Pass';
  }
  if (course.total >= 95) return 'A+';
  else if (course.total >= 90) return 'A0';
  else if (course.total >= 85) return 'B+';
  else if (course.total >= 80) return 'B0';
  else if (course.total >= 75) return 'C+';
  else if (course.total >= 70) return 'C0';
  else if (course.total >= 65) return 'D+';
  else if (course.total >= 60) return 'D0';
  else return 'F';
};

  // 각 과목의 총점을 계산하는 함수입니다.
  const calculateTotal = (course) => {
    return course.attendance + course.assignment + course.midterm + course.final;
    };


// 초기 과목 데이터 예시입니다.
const initialCourses = [
  { id: 1, type: '전공', required: '필수', name: '소프트웨어공학', credit: 3, attendance: 20, assignment: 20, midterm: 25, final: 30, total: 95, average:' ', grade: 'A' }
];

  // IT 관련 과목 리스트
  const itCourses = [
    "프로그래밍 기초",
    "웹 개발",
    "데이터베이스 시스템",
    "컴퓨터 네트워크",
    "운영체제",
    "인공지능",
    "기계학습",
    "모바일 앱 개발",
    "보안 기초",
    "클라우드 컴퓨팅"
  ];
  
const App = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [editCourses, setEditCourses] = useState(initialCourses);
  const [selectedCourses, setSelectedCourses] = useState([]);
  // 과목 점수를 업데이트하는 함수입니다.
  const handleScoreChange = (courseId, field, value) => {
    setEditCourses(editCourses.map(course => {
      if (course.id === courseId) {
        let updatedCourse = { ...course };
  
        // 숫자 필드인 경우에만 parseInt 적용 및 범위 제한
        if (field === 'attendance' || field === 'assignment') {
          updatedCourse[field] = Math.max(0, Math.min(parseInt(value, 10), 20));
        } else if (field === 'midterm' || field === 'final') {
          updatedCourse[field] = Math.max(0, Math.min(parseInt(value, 10), 30));
        } else if (field === 'credit') {
          updatedCourse[field] = parseInt(value, 10);
        } else {
          // 문자열 필드 (과목명 등)은 직접 업데이트
          updatedCourse[field] = value;
        }
  
        // 총점 및 성적 계산 (과목명 변경 시에는 불필요)
        if (field !== 'name') {
          updatedCourse.total = calculateTotal(updatedCourse);
          updatedCourse.grade = calculateGrade(updatedCourse);
        }
  
        return updatedCourse;
      }
      return course;
    }));
    if (field === 'type') {
      setEditCourses(editCourses.map(course =>
        course.id === courseId ? { ...course, type: value } : course
      ));
    }
    if (field === 'required') {
      setEditCourses(editCourses.map(course =>
        course.id === courseId ? { ...course, required: value } : course
      ));
    }
    if (field === 'credit') {
      setEditCourses(editCourses.map(course =>
        course.id === courseId ? { ...course, credit: parseInt(value, 10) } : course
      ));
    }
  };


  // 새 과목을 추가하는 함수입니다.
  const addCourse = () => {
    const newCourse = {
      id: Date.now(), // 유니크한 id를 생성하기 위해 현재 timestamp를 사용합니다.
      type: '전공',
      required: '필수',
      name: '',
      credit: 1,
      attendance: 0,
      assignment: 0,
      midterm: 0,
      final: 0,
      total: 0,
      average: '',
      grade: calculateGrade(0) // 초기 등급은 항상 'F'입니다.
    };
    const updatedEditCourses = editCourses.concat(newCourse);
    setEditCourses(updatedEditCourses);
    // 새 과목을 추가한 후 즉시 정렬
    setCourses(sortCourses(updatedEditCourses));
  };

  const saveCourses = () => {
    setCourses(editCourses.map(course => {
      const total = calculateTotal(course);
      return { ...course, total, grade: calculateGrade(total) };
    }));
  };

  const handleCheckboxChange = (courseId) => {
    setSelectedCourses(prevSelectedCourses =>
      prevSelectedCourses.includes(courseId)
        ? prevSelectedCourses.filter(id => id !== courseId)
        : [...prevSelectedCourses, courseId]
    );
  };

  const deleteCourses = () => {
    const updatedEditCourses = editCourses.filter(course => !selectedCourses.includes(course.id));
    setEditCourses(updatedEditCourses);
    // 과목을 삭제한 후 즉시 정렬
    setCourses(sortCourses(updatedEditCourses));
    setSelectedCourses([]);
  };

  // courses 배열을 정렬하는 함수
  const sortCourses = (courses) => {
    return [...courses].sort((a, b) => {
        // 이수 유형에 따라 정렬
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        // 필수 여부에 따라 정렬
        if (a.required !== b.required) {
          return a.required.localeCompare(b.required);
        }
        // 과목명에 따라 정렬
        return a.name.localeCompare(b.name);
      });
  };

  // courses 배열이 변경될 때마다 정렬을 수행하지만,
  // 이제 추가나 삭제 처리 시에도 즉시 반영됩니다.
  useEffect(() => {
    setCourses(sortCourses(courses));
  }, [courses]);


  // 전체 과목의 합계와 평균을 계산하는 함수입니다.
  const calculateSummaries = () => {
    const totals = courses.reduce((acc, course) => {
      acc.totalCredit += course.credit;
      acc.totalAttendance += course.attendance;
      acc.totalAssignment += course.assignment;
      acc.totalMidterm += course.midterm;
      acc.totalFinal += course.final;
      acc.totalTotal += course.total;
      return acc;
    }, {totalCredit:0, totalAttendance: 0, totalAssignment: 0, totalMidterm: 0, totalFinal: 0, totalTotal: 0 });

    const averageScore = courses.length ? (totals.totalTotal / courses.length) : 0;

    return {
      ...totals,
      average: averageScore,
      averageGrade: calculateGrade(averageScore) 
    };
  };
  // 평균 성적을 계산합니다.
  const summaries = calculateSummaries();

  return (
    <div className="App">
      <h1>Front-end 과제</h1>
      <button onClick={addCourse}>과목 추가</button>
      <button onClick={saveCourses}>저장</button>
      <button onClick={deleteCourses}>삭제</button>
      <table>
        <thead>
          <tr>
            <th></th> {/* 체크박스 열 */}
            <th>이수</th>
            <th>필수</th>
            <th>과목명</th>
            <th>학점</th>
            <th>출석점수</th>
            <th>과제점수</th>
            <th>중간점수</th>
            <th>기말고사 점수</th>
            <th>총점</th>
            <th>평균</th>
            <th>성적</th>
          </tr>
        </thead>
        <tbody>
          {editCourses.map((course, index) => (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleCheckboxChange(course.id)}
                />
              </td>
              <td>
                <select
                  value={course.type}
                  onChange={(e) => handleScoreChange(course.id, 'type', e.target.value)}
                >
                  <option value="전공">전공</option>
                  <option value="교양">교양</option>
                </select>
              </td>
              <td>
                <select
                  value={course.required}
                  onChange={(e) => handleScoreChange(course.id, 'required', e.target.value)}
                >
                  <option value="필수">필수</option>
                  <option value="선택">선택</option>
                </select>
              </td>
              <td>
                <select
                  value={course.name}
                  onChange={(e) => handleScoreChange(course.id, 'name', e.target.value)}
                >
                  {itCourses.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={course.credit}
                  onChange={(e) => handleScoreChange(course.id, 'credit', e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={course.attendance}
                  onChange={(e) => handleScoreChange(course.id, 'attendance', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={course.assignment}
                  onChange={(e) => handleScoreChange(course.id, 'assignment', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={course.midterm}
                  onChange={(e) => handleScoreChange(course.id, 'midterm', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={course.final}
                  onChange={(e) => handleScoreChange(course.id, 'final', e.target.value)}
                />
              </td>
              <td>{course.total}</td>
              <td>{course.average}</td>
              <td className={course.grade === 'F' ? 'grade-F' : ''}>{course.grade}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">합계</td>
            <td>{summaries.totalCredit}</td>
            <td>{summaries.totalAttendance}</td>
            <td>{summaries.totalAssignment}</td>
            <td>{summaries.totalMidterm}</td>
            <td>{summaries.totalFinal}</td>
            <td>{summaries.totalTotal}</td>
            <td>{summaries.average.toFixed(2)}</td>
            <td className={summaries.averageGrade === 'F' ? 'grade-F' : ''}>{summaries.averageGrade}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default App;