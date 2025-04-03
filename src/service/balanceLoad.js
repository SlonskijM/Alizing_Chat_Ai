const hosts = [
  { url: 11434, load: 0, max_load: process.env.MAXLOAD || 5 },
  // { url: 11435, load: 0, max_load: process.env.MAXLOAD || 5 },
  // { url: 11436, load: 0, max_load: process.env.MAXLOAD || 5 },
];

class BalanceLoad {
  balanceLoad() {
    const sortedHosts = hosts
      .filter((host) => host.load < host.max_load)
      .sort((a, b) => a.load - b.load);
    const available = sortedHosts.length > 0 ? sortedHosts[0] : null;
    if (available) {
      available.load += 1;
    }
    console.log('Состояние хостов на +: ', hosts);

    return sortedHosts.length > 0 ? sortedHosts[0] : null;
  }

  releaseHost(host) {
    const foundHost = hosts.find((h) => h.url === host);
    if (foundHost) {
      foundHost.load = Math.max(0, foundHost.load - 1);
    }
    console.log('Состояние хостов на -: ', hosts);
  }
}

export default new BalanceLoad();
