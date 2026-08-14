# VentBot — The Cubicle Confessional & Jargon Exorcist

> An AI-powered creative workplace companion that turns frustration into empathy and corporate jargon into something humans can actually understand.

## Overview

VentBot is a lightweight AI-powered web application built for one simple purpose:

**Make a frustrating workday slightly less frustrating.**

Users can type anything from a workplace frustration to an unreadable corporate message. VentBot automatically determines what kind of response is appropriate and switches between two modes:

| Mode | Purpose |
|---|---|
| **Vent Mode** | Responds with genuine empathy and an optional humorous reframe |
| **Jargon Mode** | Translates corporate language into real meaning, a 5-year-old explanation, and a pirate version |

VentBot also generates a **mood score from 1–10**, stores session information, and includes a safety-oriented `concern_flag` to avoid inappropriate humor when a message indicates a more serious situation.

---

## Features

- Vent Mode with empathy-first responses
- Corporate Jargon Translator
- Real-meaning translation
- 5-year-old explanation
- Pirate translation
- AI-generated mood score
- Safety-aware `concern_flag`
- Personality-driven loading messages
- Serverless AWS backend
- Session and response logging with DynamoDB
- Public web deployment
- Structured JSON AI responses

---

## Example

### Jargon Mode

**Input**

> Let's leverage our existing bandwidth, align with key stakeholders, and circle back next week.

**VentBot**

| Version | Response |
|---|---|
| Real meaning | Let's discuss this later when everyone is available. |
| 5-year-old | Let's talk about it later. |
| Pirate | Arrr, we'll talk about it later! |

### Vent Mode

**Input**

> I've been debugging the same deployment issue for four hours.

**VentBot**

**Empathy:**  
That sounds genuinely exhausting. Spending hours chasing the same issue can make an entire workday feel wasted.

**Reframe:**  
At least the bug has officially become a full-time coworker.

---

## Architecture

```text
                         USER
                           |
                           v
                    +------------+
                    |  Netlify   |
                    |  Frontend  |
                    +------+-----+
                           |
                       POST /chat
                           |
                           v
                    +------------+
                    | API Gateway|
                    +------+-----+
                           |
                           v
                    +------------+
                    |   Lambda   |
                    | VentBot API|
                    +------+-----+
                           |
                  +--------+--------+
                  |                 |
                  v                 v
           +-------------+   +------------+
           | Gemini API  |   |  DynamoDB  |
           | Generative  |   | Sessions   |
           | AI          |   | Mood Data  |
           +-------------+   +------------+
