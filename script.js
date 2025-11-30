// 22시 이전: 1000원당 5곡 (곡당 200원)
const SONGS_PER_1000_BEFORE_22 = 5;
// 22시 이후: 1000원당 4곡 (곡당 250원)
const SONGS_PER_1000_AFTER_22 = 4;

// 고정 시간 상품 (시간대 무관)
const PKG_35_MIN = 35;
const PKG_35_MIN_PRICE = 3000;
const PKG_70_MIN = 70;
const PKG_70_MIN_PRICE = 5000;

// 22시 이전 곡 패키지 (가성비 좋은 순으로 정렬)
const SONG_PACKAGES = [
  { songs: 25, price: 5000 },
  { songs: 15, price: 3000 },
  { songs: 10, price: 2000 },
  { songs: 5, price: 1000 },
];

// 22시 이후 곡 패키지
const SONG_PACKAGES_AFTER_22 = [
  { songs: 20, price: 5000 },
  { songs: 12, price: 3000 },
  { songs: 8, price: 2000 },
  { songs: 4, price: 1000 },
];

/**
 * 금액을 입력받아 예상 곡 수와 시간을 계산합니다.
 */
function calculateByPrice() {
  const priceInput = document.getElementById("price-input");
  const price = parseInt(priceInput.value);
  const timeSelect = document.getElementById("time-select").value;
  const resultElement = document.getElementById("songs-result-price");

  if (isNaN(price) || price <= 0) {
    resultElement.innerHTML = "유효한 금액을 입력해주세요.";
    return;
  }

  let timeLabel;
  let packages;

  if (timeSelect === "before22") {
    timeLabel = "22시 이전";
    packages = SONG_PACKAGES;
  } else {
    timeLabel = "22시 이후";
    packages = SONG_PACKAGES_AFTER_22;
  }

  let totalSongs = 0;
  let remainingPrice = price;
  let calculationParts = [];

  // --- 1. 곡 수 계산 로직 ---
  // 가장 큰 금액 패키지부터 순차적으로 계산
  packages.forEach((pkg) => {
    if (remainingPrice >= pkg.price) {
      const count = Math.floor(remainingPrice / pkg.price);
      totalSongs += count * pkg.songs;
      remainingPrice -= count * pkg.price;
      if (count > 0) {
        calculationParts.push(
          `${pkg.songs}곡(${pkg.price.toLocaleString()}원) x ${count}개`
        );
      }
    }
  });

  if (remainingPrice > 0) {
    calculationParts.push(
      `잔액 ${remainingPrice.toLocaleString()}원 (구매 불가)`
    );
  }

  // --- 2. 시간 계산 로직 ---
  let totalMinutes = 0;
  let timePrice = price; // 시간 패키지 구매를 위한 금액
  let timeCalculationParts = [];

  // 가장 가성비 좋은 70분 패키지로 최대한 계산
  const num70 = Math.floor(timePrice / PKG_70_MIN_PRICE);
  if (num70 > 0) {
    totalMinutes += num70 * PKG_70_MIN;
    timePrice -= num70 * PKG_70_MIN_PRICE;
    timeCalculationParts.push(
      `${PKG_70_MIN}분(${PKG_70_MIN_PRICE.toLocaleString()}원) x ${num70}개`
    );
  }

  // 남은 금액으로 35분 패키지 계산
  const num35 = Math.floor(timePrice / PKG_35_MIN_PRICE);
  if (num35 > 0) {
    totalMinutes += num35 * PKG_35_MIN;
    timePrice -= num35 * PKG_35_MIN_PRICE;
    timeCalculationParts.push(
      `${PKG_35_MIN}분(${PKG_35_MIN_PRICE.toLocaleString()}원) x ${num35}개`
    );
  }

  // '약' 조건 설정: 잔액이 0보다 크면 '약'을 붙임
  const useApproximate = timePrice > 0;

  // --- 3. 최종 출력 포맷 변경 (곡 수 + 시간) ---
  const styledSongs = `<strong class="result-highlight">${totalSongs}곡</strong>`;

  let timePrefix = "";
  let styledTime = "";
  if (totalMinutes > 0) {
    timePrefix = useApproximate ? " 또는 약 " : " 또는 ";
    styledTime = `${timePrefix}<strong class="result-highlight">${totalMinutes}분</strong>`;
  }

  resultElement.innerHTML = `[${timeLabel}] <strong class="result-highlight">${price.toLocaleString()}원</strong>으로 ${styledSongs}${styledTime} 이용가능`;
  resultElement.style.color = "#007bff";

  // 곡 계산식과 시간 계산식을 분리하여 출력
  const songInfoText =
    calculationParts.length > 0
      ? calculationParts.join(" + ") +
        (remainingPrice > 0
          ? `, 잔액 ${remainingPrice.toLocaleString()}원`
          : "")
      : "곡 계산 불가";

  const timeInfoText =
    timeCalculationParts.length > 0
      ? timeCalculationParts.join(" + ") +
        (timePrice > 0 ? `, 잔액 ${timePrice.toLocaleString()}원` : "")
      : "시간 계산 불가";

  resultElement.innerHTML += `<div class="calculation-info">🎶 곡 패키지: ${songInfoText}</div>`;
  if (totalMinutes > 0) {
    resultElement.innerHTML += `<div class="calculation-info">⏰ 시간 패키지: ${timeInfoText}</div>`;
  }
}

/**
 * 곡 수를 입력받아 예상 금액을 계산합니다.
 */
function calculateBySongs() {
  const songsInput = document.getElementById("songs-input");
  const songs = parseInt(songsInput.value);
  const timeSelect = document.getElementById("time-select").value;
  const resultElement = document.getElementById("price-result-songs");

  if (isNaN(songs) || songs <= 0) {
    resultElement.innerHTML = "유효한 곡 수를 입력해주세요.";
    return;
  }

  const packages =
    timeSelect === "before22" ? SONG_PACKAGES : SONG_PACKAGES_AFTER_22;
  const timeLabel = timeSelect === "before22" ? "22시 이전" : "22시 이후";

  let requiredSongs = songs;
  let totalCost = 0;
  let totalSongs = 0;
  let calculationParts = [];

  // 그리디 알고리즘: 가장 큰 패키지부터 사용
  packages.forEach((pkg) => {
    if (requiredSongs >= pkg.songs) {
      const count = Math.floor(requiredSongs / pkg.songs);
      totalCost += count * pkg.price;
      totalSongs += count * pkg.songs;
      requiredSongs -= count * pkg.songs;
      if (count > 0) {
        calculationParts.push(
          `${pkg.songs}곡(${pkg.price.toLocaleString()}원) x ${count}개`
        );
      }
    }
  });

  // 남은 곡 수가 있을 경우, 최소 단위 패키지를 추가
  if (requiredSongs > 0) {
    const smallestPkg = packages[packages.length - 1];
    const count = Math.ceil(requiredSongs / smallestPkg.songs);
    totalCost += count * smallestPkg.price;
    totalSongs += count * smallestPkg.songs;
    calculationParts.push(
      `${
        smallestPkg.songs
      }곡(${smallestPkg.price.toLocaleString()}원) x ${count}개`
    );
  }

  // 결과 문구 결정: 요청 곡 수와 구매 총 곡 수가 다를 때만 '최소'를 붙임
  const moneyPrefix = songs === totalSongs ? "" : "최소";

  const styledCost = `<strong class="result-highlight">${totalCost.toLocaleString()}원</strong>`;

  resultElement.innerHTML = `[${timeLabel}] <strong class="result-highlight">${songs}곡</strong>을 부르기 위해 ${moneyPrefix} ${styledCost} 필요함`;

  const infoText =
    calculationParts.length > 0 ? calculationParts.join(" + ") : "계산 불가";
  resultElement.innerHTML += `<div class="calculation-info">${infoText} &#x27A1; (총 ${totalSongs}곡)</div> `;
}

/**
 * 시간을 입력받아 최소 금액을 계산합니다 (고정 시간 상품 기준).
 */
function calculateByTime() {
  const timeInput = document.getElementById("time-input");
  const targetTime = parseInt(timeInput.value);
  const resultElement = document.getElementById("price-result-time");

  if (isNaN(targetTime) || targetTime <= 0) {
    resultElement.innerHTML = "유효한 시간을 입력해주세요.";
    return;
  }

  let requiredPrice = 0;
  let totalTime = 0;
  let calculationParts = [];

  if (targetTime <= PKG_35_MIN) {
    requiredPrice = PKG_35_MIN_PRICE;
    totalTime = PKG_35_MIN;
    calculationParts.push(
      `${PKG_35_MIN}분(${PKG_35_MIN_PRICE.toLocaleString()}원) x 1개`
    );
  } else if (targetTime <= PKG_70_MIN) {
    requiredPrice = PKG_70_MIN_PRICE;
    totalTime = PKG_70_MIN;
    calculationParts.push(
      `${PKG_70_MIN}분(${PKG_70_MIN_PRICE.toLocaleString()}원) x 1개`
    );
  } else {
    // 70분 초과 조합 계산 로직

    // 옵션 1: 70분 패키지로만 충족시키는 경우
    const num70PkgsOnly = Math.ceil(targetTime / PKG_70_MIN);
    const price70Only = num70PkgsOnly * PKG_70_MIN_PRICE;
    const time70Only = num70PkgsOnly * PKG_70_MIN;
    const info70Only = [
      `${PKG_70_MIN}분(${PKG_70_MIN_PRICE.toLocaleString()}원) x ${num70PkgsOnly}개`,
    ];

    // 옵션 2: 70분 패키지 n-1개 + 35분 패키지 조합
    let priceMixed = Infinity;
    let infoMixed = [];
    let timeMixed = 0;

    const num70 = Math.floor(targetTime / PKG_70_MIN);
    const remainingTime = targetTime - num70 * PKG_70_MIN;

    if (remainingTime > 0) {
      const num35 = Math.ceil(remainingTime / PKG_35_MIN);
      priceMixed = num70 * PKG_70_MIN_PRICE + num35 * PKG_35_MIN_PRICE;
      timeMixed = num70 * PKG_70_MIN + num35 * PKG_35_MIN;

      if (num70 > 0)
        infoMixed.push(
          `${PKG_70_MIN}분(${PKG_70_MIN_PRICE.toLocaleString()}원) x ${num70}개`
        );
      if (num35 > 0)
        infoMixed.push(
          `${PKG_35_MIN}분(${PKG_35_MIN_PRICE.toLocaleString()}원) x ${num35}개`
        );
    }

    if (price70Only <= priceMixed) {
      requiredPrice = price70Only;
      totalTime = time70Only;
      calculationParts = info70Only;
    } else {
      requiredPrice = priceMixed;
      totalTime = timeMixed;
      calculationParts = infoMixed;
    }
  }

  // 결과 문구 결정: 요청 시간과 구매 총 시간이 다를 때만 '최소'를 붙임
  const moneyPrefix = targetTime === totalTime ? "" : "최소";

  // 가격 강조를 위해 <strong> 태그와 클래스 적용
  const styledPrice = `<strong class="result-highlight">${requiredPrice.toLocaleString()}원</strong>`;
  const finalPhrase = `${moneyPrefix} ${styledPrice} 필요함 (총 ${totalTime}분)`;

  resultElement.innerHTML = `<strong class="result-highlight">${targetTime}분</strong>을 부르기 위해 ${finalPhrase}`;

  const infoText =
    calculationParts.length > 0 ? calculationParts.join(" + ") : "계산 불가";

  resultElement.innerHTML += `<div class="calculation-info">${infoText}</div>`;
}

/**
 * 모든 입력 필드와 결과 영역을 초기화합니다.
 */
function resetCalculator() {
  // 1. 입력 필드 초기화
  document.getElementById("time-select").value = "before22";
  document.getElementById("price-input").value = "";
  document.getElementById("songs-input").value = "";
  document.getElementById("time-input").value = "";

  // 2. 결과 영역 초기화
  document.getElementById("songs-result-price").innerHTML = "";
  document.getElementById("price-result-songs").innerHTML = "";
  document.getElementById("price-result-time").innerHTML = "";
}
