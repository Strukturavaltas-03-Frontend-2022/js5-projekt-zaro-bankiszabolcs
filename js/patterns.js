const patterns = {
  /* name: /^[A-Z][a-zA-z]+( [A-Z][a-zA-z]+){1,2}$/,
  emailAddress: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  address: /^\d+ ([A-Z][a-z]+){2,}$/, */
  name: /\w/,
  emailAddress: /\w/,
  address: /\w/, 
};

export default (values) => {
  const result1 = patterns.name.exec(values.name);
  const result2 = patterns.emailAddress.exec(values.emailAddress);
  const result3 = patterns.address.exec(values.address);

  const results = [result1, result2, result3];

  return !results.includes(null);
};
