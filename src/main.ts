import "./style.css";
import { saveGknuCalendarICS } from "./calendar.ts";

const downloadBtn = document.querySelector<HTMLButtonElement>("#downloadBtn")!;
const yearInput = document.querySelector<HTMLInputElement>("#yearInput")!;

// 현재 연도로 초기값 설정
yearInput.value = new Date().getFullYear().toString();

downloadBtn.addEventListener("click", async () => {
  const year = parseInt(yearInput.value, 10);

  if (isNaN(year) || year < 2000 || year > 2100) {
    alert("올바른 연도를 입력해주세요 (2000-2100)");
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = "다운로드 중...";

  try {
    await saveGknuCalendarICS(year);
    downloadBtn.textContent = "다운로드 완료!";
    setTimeout(() => {
      downloadBtn.textContent = "캘린더 생성 및 다운로드";
      downloadBtn.disabled = false;
    }, 2000);
  } catch (err) {
    console.error(err);
    alert(`캘린더 다운로드 실패: ${err}`);
    downloadBtn.textContent = "캘린더 생성 및 다운로드";
    downloadBtn.disabled = false;
  }
});
