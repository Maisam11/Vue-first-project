export default {
  getUsers: (state) => state.users,
  getUserById: (state) => (id) => state.users.find((user) => user.id === id),
  getFormSubmissions: (state) => state.formSubmissions,
  getFormSubmissionById: (state) => (id) =>
    state.formSubmissions.find((submission) => submission.id === id),
  getCombinedUserData: (state) => {
    const regularUsers = (state.users || []).map((user) => ({
      ...user,
      isFormSubmission: false,
      type: "user",
    }));
    const formUsers = (state.formSubmissions || []).map((sub) => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      dob: sub.dob,
      age: sub.age,
      homePhone: sub.homePhone || "--",
      mobilePhone: sub.mobilePhone || "--",
      addresses: sub.addresses || [],
      isFormSubmission: true,
      type: "form",
    }));
    return [...regularUsers, ...formUsers];
  },
};