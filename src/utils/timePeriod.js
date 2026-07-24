export function getPeriod() {

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 6) {
    return "amanhecer";
  }

  if (hour >= 6 && hour < 12) {
    return "dia";
  }

  if (hour >= 12 && hour < 18) {
    return "entardecer";
  }

  return "noite";

}

export function isNightPeriod() {

  return getPeriod() === "noite";

}