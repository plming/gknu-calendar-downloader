import "./style.css";
import { buildICS } from "./calendar.ts";
import { fetchEventsOnYear } from "./scraper.ts";

const yearInput = document.querySelector<HTMLInputElement>("#yearInput")!;
yearInput.value = new Date().getFullYear().toString();

const downloadBtn = document.querySelector<HTMLButtonElement>("#downloadBtn")!;
downloadBtn.addEventListener("click", async () => {
  const year = parseInt(yearInput.value, 10);

  if (isNaN(year) || year < 2000 || year > 2100) {
    alert("올바른 연도를 입력해주세요 (2000-2100)");
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = "다운로드 중...";

  try {
    const events = await fetchEventsOnYear(year);
    const ics = buildICS(events);
    downloadText(`gknu-${year}.ics`, ics);
  } catch (err) {
    console.error(err);
    alert(`캘린더 다운로드 실패: ${err}`);
  } finally {
    downloadBtn.textContent = "캘린더 생성 및 다운로드";
    downloadBtn.disabled = false;
  }
});

function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
