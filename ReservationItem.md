ClassReservation
url: GET https://localhost:8000/api/class-reservations/student/B9126010-4FF5-4F98-B085-CCE9E7D8CBA4
response
[
    {
        "id": "b9126010-4af5-4c98-a085-cfe912d5dfa3",
        "studentID": "b9126010-4ff5-4f98-b085-cce9e7d8cba4",
        "coursePackageID": null,
        "packageCode": null,
        "packageName": null,
        "packageImageUrl": null,
        "totalPrice": null,
        "description": null,
        "reservationStatus": "Đang xử lý",
        "expiresAt": "2025-09-30T00:00:00",
        "createdAt": "0001-01-01T00:00:00"
    },
    {
        "id": "b9126010-4ff5-4f98-b085-cce9e7d8dfa2",
        "studentID": "b9126010-4ff5-4f98-b085-cce9e7d8cba4",
        "coursePackageID": null,
        "packageCode": null,
        "packageName": null,
        "packageImageUrl": null,
        "totalPrice": null,
        "description": null,
        "reservationStatus": "Complete",
        "expiresAt": "2025-09-30T00:00:00",
        "createdAt": "0001-01-01T00:00:00"
    }
]


ReservationItem
url: GET https://localhost:8000/api/reservation-items/by-reservation/B9126010-4FF5-4F98-B085-CCE9E7D8DFA2
response:
[
    {
        "id": "a9126010-4ff5-4f98-b085-cfd3e7d8bfa6",
        "paymentSequence": null,
        "courseId": "30b53012-701e-4521-b246-2f7569f3a783",
        "courseCode": "PY201",
        "courseName": "Python for Data Analysis",
        "courseImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt2pzxnRCgsc-bl04gdPbHyXh_QKYaS_ltxA&s",
        "description": null,
        "standardPrice": 4000000.00,
        "categoryName": "Data Science",
        "invoiceId": null,
        "invoiceStatus": null,
        "planType": "Instalment",
        "classReservationId": "b9126010-4ff5-4f98-b085-cce9e7d8dfa2"
    }
]

