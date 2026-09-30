document.querySelectorAll(".contact-copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;

    try {
      await navigator.clipboard.writeText(text);
      alert(`${text} 복사되었습니다.`);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  });
});