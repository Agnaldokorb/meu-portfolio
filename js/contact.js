const CONTACT_EMAIL = "contato@agnaldo.dev.br";
const WHATSAPP_NUMBER = "5547999253962";

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const channelInputs = contactForm.querySelectorAll("input[name='canal']");
  const noteElement = document.querySelector("#contact-note");
  const statusElement = document.querySelector("#contact-status");

  const updateNote = () => {
    const selectedChannel = contactForm.querySelector(
      "input[name='canal']:checked",
    )?.value;

    if (selectedChannel === "whatsapp") {
      noteElement.textContent =
        "Ao enviar por WhatsApp, uma conversa sera aberta com a mensagem pronta para envio.";
      return;
    }

    noteElement.textContent =
      "Ao enviar por e-mail, sera aberto seu cliente de e-mail padrao com a mensagem preenchida.";
  };

  const buildMessage = (formData) => {
    return [
      `Nome: ${formData.nome}`,
      `Email: ${formData.email}`,
      "",
      "Mensagem:",
      formData.mensagem,
    ].join("\n");
  };

  const submitToEmail = (formData) => {
    const subject = encodeURIComponent(formData.assunto);
    const body = encodeURIComponent(buildMessage(formData));
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  const submitToWhatsapp = (formData) => {
    const text = encodeURIComponent(
      [
        `Ola, Agnaldo! Meu nome e ${formData.nome}.`,
        `Assunto: ${formData.assunto}`,
        "",
        formData.mensagem,
        "",
        `Meu e-mail para retorno: ${formData.email}`,
      ].join("\n"),
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  channelInputs.forEach((input) => {
    input.addEventListener("change", updateNote);
  });

  updateNote();

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    statusElement.textContent = "";

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = {
      nome: contactForm.nome.value.trim(),
      email: contactForm.email.value.trim(),
      assunto: contactForm.assunto.value.trim(),
      mensagem: contactForm.mensagem.value.trim(),
    };

    const channel = contactForm.querySelector(
      "input[name='canal']:checked",
    )?.value;

    if (channel === "whatsapp") {
      submitToWhatsapp(formData);
      statusElement.textContent =
        "Abrindo WhatsApp com sua mensagem preenchida.";
      return;
    }

    submitToEmail(formData);
    statusElement.textContent =
      "Abrindo cliente de e-mail para envio da mensagem.";
  });
}
