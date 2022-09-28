const patterns = {
  name: /^([A-ZÁÉÓŐÖÚŰÍ][a-záéóúüűöőí]+ )+([A-ZÁÉÓŐÖÚŰÍ][a-záéóúüűöőí]+){1,3}$/,
  emailAddress: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  address: /^[0-9]+ ([A-ZÁÉÓŐÖÚŰÍ][a-záéóúüűöőí]+ )+([A-ZZÁÉÓŐÖÚŰÍ][a-zzáéóúüűöőí]+)$/,
};

export default (values) => {
  const result1 = patterns.name.exec(values.name);
  const result2 = patterns.emailAddress.exec(values.emailAddress);
  const result3 = patterns.address.exec(values.address);
  const results = [result1, result2, result3];

  return !results.includes(null);
};
