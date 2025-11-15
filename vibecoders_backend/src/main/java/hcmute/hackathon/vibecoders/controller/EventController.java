package hcmute.hackathon.vibecoders.controller;

import hcmute.hackathon.vibecoders.dto.response.ResponseData;
import hcmute.hackathon.vibecoders.entity.Event;
import hcmute.hackathon.vibecoders.service.impl.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseData<Event> createEvent(@RequestBody Event event) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", eventService.createEvent(event));
    }


    @GetMapping("/{id}")
    public ResponseData<?> getEventById(@PathVariable String id) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()));
    }

    @PutMapping("/{id}")
    public ResponseData<?> updateEvent(@RequestBody Event event) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", eventService.updateEvent(event));
    }

    @DeleteMapping("/{id}")
    public ResponseData<?> deleteEvent(@PathVariable String id) {
        return new ResponseData<>(HttpStatus.CREATED.value(),"Success", eventService.deleteEvent(id));
    }

    @GetMapping
    public ResponseData<?> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        return new ResponseData<>(
                HttpStatus.OK.value(),
                "Success",
                eventService.getEvents(page, size, keyword)
        );
    }
}
